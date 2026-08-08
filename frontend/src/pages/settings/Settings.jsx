import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  IdCard,
  MapPin,
  LifeBuoy,
  LogOut,
  ChevronRight,
  Camera,
  Loader2,
  UserCog,
  Lock,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { useAuth } from "../../hooks/useAuth";
import { assets } from "../../assets/assets";
import { updateProfileImage, updateProfile, updatePassword } from "../../services/auth";

const LINKS = [
  { to: "/settings/saved-places", label: "Saved places", icon: MapPin },
  { to: "/settings/help", label: "Help & support", icon: LifeBuoy },
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [editOpen, setEditOpen] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSaved, setNameSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function openEditModal() {
    setName(user?.name || "");
    setNameError("");
    setNameSaved(false);
    setPasswordForm({ current: "", next: "", confirm: "" });
    setPasswordError("");
    setPasswordSaved(false);
    setEditOpen(true);
  }

  async function handleNameSave(e) {
    e.preventDefault();
    setNameError("");
    setNameSaved(false);

    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }

    setNameSaving(true);
    try {
      const data = await updateProfile({ name: name.trim() });
      updateUser(data.user);
      setNameSaved(true);
    } catch (err) {
      setNameError(err.message || "Failed to update name");
    } finally {
      setNameSaving(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);

    if (!passwordForm.current || !passwordForm.next) {
      setPasswordError("Fill in both password fields");
      return;
    }
    if (passwordForm.next.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("New passwords don't match");
      return;
    }

    setPasswordSaving(true);
    try {
      await updatePassword({ currentPassword: passwordForm.current, newPassword: passwordForm.next });
      setPasswordForm({ current: "", next: "", confirm: "" });
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  }

  function handleAvatarClick() {
    if (!uploading) fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Image must be smaller than 5 MB");
      return;
    }

    setUploading(true);
    try {
      const data = await updateProfileImage(file);
      updateUser(data.user);
    } catch (err) {
      setUploadError(err.message || "Failed to update profile picture");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-2xl">
        <Card className="flex items-center gap-4 p-6">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={uploading}
            className="group relative h-16 w-16 shrink-0 cursor-pointer rounded-full disabled:cursor-not-allowed"
            aria-label="Change profile picture"
          >
            <img
              src={user?.image || assets.user_profile}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-violet-500/30"
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={18} />}
            </span>
            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white">
                <Loader2 size={20} className="animate-spin" />
              </span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold">{user?.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-text-dim">
              <Mail size={14} className="text-violet-600" />
              {user?.email}
            </p>
            {user?.id && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-text-faint">
                <IdCard size={13} />
                ID: {user.id}
              </p>
            )}
          </div>
          <Button variant="secondary" onClick={openEditModal} className="shrink-0">
            <UserCog size={16} />
            Edit profile
          </Button>
        </Card>

        {uploadError && (
          <div role="alert" className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
            {uploadError}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Card className="flex items-center justify-between px-5 py-4 transition-colors hover:border-violet-400/30">
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <Icon size={18} className="text-violet-600" />
                  {label}
                </span>
                <ChevronRight size={16} className="text-text-faint" />
              </Card>
            </Link>
          ))}
        </div>

        <Button variant="danger" className="mt-8 w-full justify-center" onClick={handleLogout}>
          <LogOut size={16} />
          Log out
        </Button>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile">
        <div className="flex flex-col gap-7">
          <form onSubmit={handleNameSave} className="flex flex-col gap-3">
            <FormField
              label="Full name"
              icon={UserCog}
              required
              value={name}
              error={nameError}
              onChange={(e) => {
                setName(e.target.value);
                setNameSaved(false);
              }}
            />
            <div className="flex items-center gap-3">
              <Button type="submit" variant="secondary" loading={nameSaving} className="justify-center">
                Save name
              </Button>
              {nameSaved && (
                <span className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                  <Check size={15} />
                  Saved
                </span>
              )}
            </div>
          </form>

          <div className="border-t border-border pt-6">
            <h3 className="mb-3 text-sm font-semibold">Change password</h3>
            <form onSubmit={handlePasswordSave} className="flex flex-col gap-3">
              <FormField
                label="Current password"
                type={showPassword ? "text" : "password"}
                icon={Lock}
                autoComplete="current-password"
                value={passwordForm.current}
                onChange={(e) => {
                  setPasswordForm((f) => ({ ...f, current: e.target.value }));
                  setPasswordSaved(false);
                }}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="cursor-pointer rounded-md p-1 text-text-faint hover:text-text-dim"
                    aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                }
              />
              <FormField
                label="New password"
                type={showPassword ? "text" : "password"}
                icon={Lock}
                autoComplete="new-password"
                value={passwordForm.next}
                onChange={(e) => {
                  setPasswordForm((f) => ({ ...f, next: e.target.value }));
                  setPasswordSaved(false);
                }}
              />
              <FormField
                label="Confirm new password"
                type={showPassword ? "text" : "password"}
                icon={Lock}
                autoComplete="new-password"
                value={passwordForm.confirm}
                error={passwordError}
                onChange={(e) => {
                  setPasswordForm((f) => ({ ...f, confirm: e.target.value }));
                  setPasswordSaved(false);
                }}
              />
              <div className="flex items-center gap-3">
                <Button type="submit" variant="secondary" loading={passwordSaving} className="justify-center">
                  Update password
                </Button>
                {passwordSaved && (
                  <span className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                    <Check size={15} />
                    Updated
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

export default Settings;
