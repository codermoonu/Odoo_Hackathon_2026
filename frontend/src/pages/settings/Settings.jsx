import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, IdCard, MapPin, LifeBuoy, LogOut, ChevronRight, Camera, Loader2 } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { assets } from "../../assets/assets";
import { updateProfileImage } from "../../services/auth";

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

  function handleLogout() {
    logout();
    navigate("/login");
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
          <div>
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
    </AppShell>
  );
}

export default Settings;
