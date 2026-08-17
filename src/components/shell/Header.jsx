import { useEffect, useState } from "react";
import { HeartHandshake, Trash2 } from "lucide-react";
import { GoogleAuthProvider, getRedirectResult, signInWithRedirect, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";
import { useMembership } from "../../hooks/useMembership";
import RecycleBin from "./RecycleBin";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Header() {
  const { user } = useAuth();
  const { isAdmin } = useMembership();
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [signInError, setSignInError] = useState("");

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (!result) {
          setSignInError("診斷：redirect 完成但沒有取回登入結果（result 為 null），瀏覽器可能把中間狀態弄丟了。");
        }
      })
      .catch((err) => {
        console.error(err);
        setSignInError(`${err.code || "登入失敗"}：${err.message || String(err)}`);
      });
  }, []);

  const handleGoogleSignIn = async () => {
    setSignInError("");
    try {
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (err) {
      console.error(err);
      setSignInError(`${err.code || "登入失敗"}：${err.message || String(err)}`);
    }
  };

  const handleSignOut = () => signOut(auth);

  return (
    <>
    <header className="sticky top-4 z-40 mb-8 backdrop-blur-2xl bg-slate-800/90 border border-slate-700/50 rounded-[2rem] shadow-2xl shadow-black/10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"></div>
      <div className="relative px-4 py-3 xl:px-6 xl:py-5 flex flex-col xl:flex-row justify-between items-center gap-3 xl:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 xl:w-14 xl:h-14 rounded-[1rem] xl:rounded-[1.2rem] bg-gradient-to-br from-slate-600 via-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-black/30 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
            <HeartHandshake className="text-slate-200 relative z-10" size={22} />
          </div>
          <div className="text-left">
            <h1 className="text-lg xl:text-2xl font-bold text-slate-100 italic leading-tight">TeamOps</h1>
            <p className="hidden sm:block text-xs xl:text-sm font-medium text-slate-300 tracking-wider italic">
              慈濟團隊工作台
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full border-2 border-slate-600" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-200 text-xs font-black">
                  {(user.displayName || user.email || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="hidden xl:block text-right">
                <p className="text-sm font-black text-slate-200 italic">{user.displayName || user.email}</p>
                <p className="text-xs text-slate-400 italic">已登入</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowRecycleBin(true)}
                  className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all"
                  title="資源回收桶"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-black italic uppercase tracking-widest transition-all"
              >
                登出
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-black italic uppercase tracking-widest transition-all shadow-lg"
              >
                <GoogleIcon />
                Google 登入
              </button>
              {signInError && (
                <p className="max-w-xs text-right text-xs font-bold text-rose-300 break-words">{signInError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>

    {isAdmin && <RecycleBin open={showRecycleBin} onClose={() => setShowRecycleBin(false)} />}
    </>
  );
}
