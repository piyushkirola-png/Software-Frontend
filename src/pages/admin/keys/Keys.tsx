import { useState } from "react";
import { Upload, Trash2, Ban, Key, Loader2, Plus } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { notify } from "../../../components/ui/toast";
import {
  useAdminKeys,
  useAdminKeyStock,
  useAdminProducts,
} from "../../../api/queries/useAdmin";
import {
  useAddKey,
  useBulkUploadKeys,
  useRevokeKey,
  useDeleteKey,
} from "../../../api/mutations/adminMutations";
import { getErrorMessage } from "../../../lib/api-client";

export default function AdminKeys() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [productId, setProductId] = useState<number | undefined>();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading } = useAdminKeys(page, 50, status || undefined, productId);
  const { data: stock = [] } = useAdminKeyStock();
  const { data: productsData } = useAdminProducts(0, 100);

  const addKey = useAddKey();
  const bulkUpload = useBulkUploadKeys();
  const revoke = useRevokeKey();
  const del = useDeleteKey();

  const [uploadProductId, setUploadProductId] = useState<number>(0);
  const [uploadVariantId, setUploadVariantId] = useState<number | undefined>();
  const [uploadBatch, setUploadBatch] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadResult, setUploadResult] = useState<any>(null);

  const [singleProductId, setSingleProductId] = useState<number>(0);
  const [singleVariantId, setSingleVariantId] = useState<number | undefined>();
  const [singleKey, setSingleKey] = useState("");
  const [singleBatch, setSingleBatch] = useState("");
  const [addError, setAddError] = useState("");

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    danger?: boolean;
    action?: () => Promise<void> | void;
  }>({ open: false, title: "", message: "" });

  const products = productsData?.content || [];
  const keys = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const handleUpload = async () => {
    setUploadError("");
    if (!uploadProductId) return setUploadError("Select a product");
    if (!uploadFile) return setUploadError("Select a CSV file");

    try {
      const result = await bulkUpload.mutateAsync({
        file: uploadFile,
        productId: uploadProductId,
        variantId: uploadVariantId,
        batchName: uploadBatch || undefined,
      });
      setUploadResult(result);
      notify.success(`Uploaded ${result.inserted} key(s)`);
    } catch (e) {
      const msg = getErrorMessage(e);
      setUploadError(msg);
      notify.error(msg);
    }
  };

  const handleAddSingle = async () => {
    setAddError("");
    if (!singleProductId) return setAddError("Select a product");
    if (!singleKey.trim()) return setAddError("Enter a license key");

    try {
      await addKey.mutateAsync({
        productId: singleProductId,
        variantId: singleVariantId,
        licenseKey: singleKey.trim(),
        batchName: singleBatch || undefined,
      });
      setAddOpen(false);
      setSingleKey("");
      setSingleBatch("");
      setSingleProductId(0);
      setSingleVariantId(undefined);
      notify.success("License key added");
    } catch (e) {
      const msg = getErrorMessage(e);
      setAddError(msg);
      notify.error(msg);
    }
  };

  const handleRevoke = (id: number) => {
    setConfirmState({
      open: true,
      title: "Revoke key?",
      message: "The key will no longer be sellable.",
      danger: true,
      action: async () => {
        try {
          await revoke.mutateAsync(id);
          notify.success("Key revoked");
        } catch (e) {
          notify.error(getErrorMessage(e));
        }
      },
    });
  };

  const handleDelete = (id: number) => {
    setConfirmState({
      open: true,
      title: "Delete key?",
      message: "This action cannot be undone.",
      danger: true,
      action: async () => {
        try {
          await del.mutateAsync(id);
          notify.success("Key deleted");
        } catch (e) {
          notify.error(getErrorMessage(e));
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy">
            License Keys
          </h1>
          <p className="text-sm text-muted mt-1">
            {data?.totalElements || 0} keys
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddOpen(true)} variant="outline">
            <Plus size={16} /> Add One
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload size={16} /> Bulk Upload
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
          <Key size={16} /> Stock Summary
        </h2>
        {stock.length === 0 ? (
          <p className="text-sm text-muted">No products yet</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
            {stock.map((s, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-lg p-3 text-xs"
              >
                <div className="font-semibold text-navy line-clamp-1">
                  {s.productTitle}
                </div>
                {s.variantName && (
                  <div className="text-[10px] text-muted mb-1">
                    {s.variantName}
                  </div>
                )}
                <div className="flex gap-3 mt-2">
                  <span className="text-success font-bold">{s.available}</span>
                  <span className="text-yellow-600">{s.reserved}</span>
                  <span className="text-brand">{s.sold}</span>
                  <span className="text-red-500">{s.revoked}</span>
                </div>
                <div className="text-[10px] text-muted mt-1">
                  Available / Reserved / Sold / Revoked
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RESERVED">Reserved</option>
          <option value="SOLD">Sold</option>
          <option value="REVOKED">Revoked</option>
        </select>
        <select
          value={productId || ""}
          onChange={(e) => {
            setProductId(e.target.value ? Number(e.target.value) : undefined);
            setPage(0);
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No keys yet</p>
            <p className="text-sm mt-1">Upload keys to start selling</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-soft">
                <tr className="text-left text-xs text-muted uppercase">
                  <th className="px-4 py-3">Key</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Variant</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-t border-gray-100 hover:bg-soft">
                    <td className="px-4 py-3 font-mono text-[11px] text-navy max-w-[200px] truncate">
                      {k.licenseKey}
                    </td>
                    <td className="px-4 py-3 text-xs text-navy line-clamp-1">
                      {k.productTitle}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {k.variantName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        color={
                          k.status === "AVAILABLE"
                            ? "green"
                            : k.status === "RESERVED"
                            ? "yellow"
                            : k.status === "SOLD"
                            ? "blue"
                            : "red"
                        }
                      >
                        {k.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {k.status !== "SOLD" && k.status !== "REVOKED" && (
                          <button
                            onClick={() => handleRevoke(k.id)}
                            className="w-8 h-8 rounded hover:bg-yellow-50 text-yellow-600 flex items-center justify-center"
                            title="Revoke"
                          >
                            <Ban size={14} />
                          </button>
                        )}
                        {k.status !== "SOLD" && (
                          <button
                            onClick={() => handleDelete(k.id)}
                            className="w-8 h-8 rounded hover:bg-red-50 text-red-500 flex items-center justify-center"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40"
          >
            ←
          </button>
          <span className="text-sm text-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}

      <Modal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setUploadResult(null);
          setUploadError("");
          setUploadFile(null);
        }}
        title="Bulk Upload License Keys"
      >
        {uploadResult ? (
          <div className="space-y-3">
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-sm">
              <div className="font-bold text-success mb-2">Upload Complete</div>
              <div className="space-y-1 text-xs">
                <div>Total rows: <b>{uploadResult.totalRows}</b></div>
                <div>Inserted: <b className="text-success">{uploadResult.inserted}</b></div>
                <div>Skipped: <b className="text-yellow-600">{uploadResult.skipped}</b></div>
              </div>
            </div>
            {uploadResult.errors?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                <div className="text-xs font-bold text-red-600 mb-1">Errors:</div>
                {uploadResult.errors.map((e: string, i: number) => (
                  <div key={i} className="text-[11px] text-red-500">
                    {e}
                  </div>
                ))}
              </div>
            )}
            <Button
              fullWidth
              onClick={() => {
                setUploadResult(null);
                setUploadFile(null);
              }}
            >
              Upload More
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Product
              </label>
              <select
                value={uploadProductId}
                onChange={(e) => {
                  setUploadProductId(Number(e.target.value));
                  setUploadVariantId(undefined);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              >
                <option value={0}>— Select Product —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Batch Name (optional)"
              value={uploadBatch}
              onChange={(e) => setUploadBatch(e.target.value)}
              placeholder="Feb2026"
            />

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                CSV File
              </label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-sm border border-gray-200 rounded-lg p-2"
              />
              <p className="text-[11px] text-muted mt-2">
                Format: one license key per line. Header row is auto-skipped.
              </p>
            </div>

            {uploadError && (
              <p className="text-xs text-red-500">{uploadError}</p>
            )}

            <Button
              fullWidth
              onClick={handleUpload}
              loading={bulkUpload.isPending}
              disabled={!uploadFile || !uploadProductId}
            >
              Upload
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Single License Key"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1.5">
              Product
            </label>
            <select
              value={singleProductId}
              onChange={(e) => setSingleProductId(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
            >
              <option value={0}>— Select Product —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="License Key"
            value={singleKey}
            onChange={(e) => setSingleKey(e.target.value)}
            placeholder="XXXXX-XXXXX-XXXXX"
          />

          <Input
            label="Batch Name (optional)"
            value={singleBatch}
            onChange={(e) => setSingleBatch(e.target.value)}
          />

          {addError && <p className="text-xs text-red-500">{addError}</p>}

          <Button
            fullWidth
            onClick={handleAddSingle}
            loading={addKey.isPending}
          >
            Add Key
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        danger={confirmState.danger}
        onCancel={() => setConfirmState({ open: false, title: "", message: "" })}
        onConfirm={async () => {
          const action = confirmState.action;
          setConfirmState({ open: false, title: "", message: "" });
          await action?.();
        }}
      />
    </div>
  );
}