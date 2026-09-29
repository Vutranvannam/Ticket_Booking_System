import { motion, AnimatePresence } from "framer-motion";
import { useOAuth2Success } from "../hooks/useOAuth2Success";
import { XCircle } from "lucide-react";

/**
 * Callback page for Google OAuth2 flow.
 *
 * This page is rendered when the backend redirects the browser to
 * /oauth2/success after a successful Google login. It has no visible
 * form — it simply exchanges the HttpOnly refresh cookie for an access token,
 * hydrates Redux with the user profile, and navigates to /dashboard.
 *
 * On failure it auto-redirects to /login?error=oauth2 after 2 seconds.
 */
export default function OAuth2SuccessPage() {
  const { error } = useOAuth2Success();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!error ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            {/* Animated spinner ring */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 48 48" aria-label="Google">
                  <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.5-4z" />
                  <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.2-17.7 10.7z" />
                  <path fill="#FBBC05" d="M24 43c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.5 34.6 26.9 35.5 24 35.5c-6 0-10.6-4-12.4-9.4l-7 5.4C8.1 39.1 15.5 43 24 43z" />
                  <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1 3-3.2 5.4-6.1 7l6.5 5.3c3.8-3.5 6.3-8.7 6.3-15.3 0-1.3-.2-2.7-.5-4z" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-text-primary">Đang đăng nhập...</h1>
              <p className="text-sm text-text-secondary">
                Đang xác thực tài khoản Google của bạn
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center max-w-sm"
          >
            <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-danger" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-text-primary">Đăng nhập thất bại</h1>
              <p className="text-sm text-text-secondary">{error}</p>
              <p className="text-xs text-text-secondary">Đang chuyển về trang đăng nhập...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
