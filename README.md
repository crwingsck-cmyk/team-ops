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
3. **Build → Authentication → 開始使用** → 在「Sign-in method」啟用 **Google**（唯一的登入方式；不開放自行註冊 Email/Password，避免任何人都能看到團隊資料）。
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
8. **白名單機制**：只有 Google 帳號無法直接看到資料——每個人第一次用 Google 登入後，畫面會顯示「尚未取得使用權限」，並附上自己的一組 ID（Firebase Auth UID）。管理員要把這個人加進白名單，才能看到資料：
   - Firestore Database → **数据** 分頁 → 依序建立路徑 `team-ops`（集合）→ `v1`（文件）→ `members`（子集合）→ 用該使用者的 UID 當作**文件 ID**，新增一個文件，隨便加一個欄位（例如 `email` 字串）即可，不需要特別的內容。
   - 第一個帳號（管理員自己）也要照這個方式手動加進去，否則自己登入後也會被擋。
   - `members` 這個子集合的文件只能由管理員手動在 Console 建立，網站本身無法自行寫入（安全規則已鎖死），避免有人繞過白名單。

完成以上設定後執行 `npm run dev`，用 Google 登入並開始使用。
