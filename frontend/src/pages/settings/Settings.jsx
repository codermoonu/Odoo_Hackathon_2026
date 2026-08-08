import { Link, useNavigate } from "react-router-dom";
import { Mail, IdCard, MapPin, LifeBuoy, LogOut, ChevronRight } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { assets } from "../../assets/assets";

const LINKS = [
  { to: "/settings/saved-places", label: "Saved places", icon: MapPin },
  { to: "/settings/help", label: "Help & support", icon: LifeBuoy },
];

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-2xl">
        <Card className="flex items-center gap-4 p-6">
          <img
            src={user?.image || assets.user_profile}
            alt=""
            className="h-16 w-16 rounded-full object-cover ring-2 ring-violet-500/30"
          />
          <div>
            <h2 className="font-display text-lg font-bold">{user?.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-text-dim">
              <Mail size={14} className="text-violet-400" />
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

        <div className="mt-6 flex flex-col gap-3">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Card className="flex items-center justify-between px-5 py-4 transition-colors hover:border-violet-400/30">
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <Icon size={18} className="text-violet-400" />
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
