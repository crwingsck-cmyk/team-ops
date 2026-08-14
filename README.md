# TeamOps 慈濟團隊工作台

團隊營運管理系統：活動公告、活動報名、志工資料庫、會議記錄、志業體運作追蹤。所有登入的團隊成員共用同一份資料。

Stack: React 18 + Vite + Tailwind CSS + Firebase (Firestore + Auth) + lucide-react。

## 開發指令

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run lint
```

## Firebase 設定（一次性，需在 Firebase Console 手動操作）

1. 前往 [Firebase Console](https://console.firebase.google.com) → 新增專案（例如命名 `team-ops`）。
2. **Build → Firestore Database → 建立資料庫** → 選擇 Production mode → 選一個 region（建議 `asia-east1`）。
3. **Build → Authentication → 開始使用** → 在「Sign-in method」啟用 **Google** 與 **Email/Password** 兩種登入方式。
4. **專案設定（齒輪圖示） → 一般 → 新增應用程式 → Web（`</>`)** → 複製產生的 `firebaseConfig`。
5. 在專案根目錄建立 `.env.local`（已列在 `.gitignore`，不會被提交）：
   ```
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```
   將對應的值從 `firebaseConfig` 貼上。
6. **Authentication → Settings → Authorized domains**：`localhost` 預設已存在；之後正式部署上線網域要另外新增。
7. 發布安全規則：把本專案的 `firestore.rules` 內容貼到 **Firestore → 規則** 分頁並按「發布」（不需要安裝 Firebase CLI）。
8. v1 沒有邀請/角色機制，每位團隊成員都需要自己的登入帳號：可直接用 Google 帳號登入，或由管理者在 **Authentication → Users → 新增使用者** 手動建立 email/password 帳號。任何登入帳號依安全規則自動取得完整讀寫權限。

完成以上設定後執行 `npm run dev`，即可用 Google 或 Email/Password 登入並開始使用。
