# TeamOps 慈濟團隊工作台

團隊營運管理系統：活動公告、活動報名、志工資料庫、會議記錄。所有登入的團隊成員共用同一份資料。

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
   - Firestore Database → **数据** 分頁 → 依序建立路徑 `team-ops`（集合）→ `v1`（文件）→ `members`（子集合）→ 用該使用者的 UID 當作**文件 ID**，新增文件，加兩個欄位：
     - `email`（string）：這個人的信箱，方便你自己辨識
     - `role`（string）：`admin` 或 `member`。**`admin` 才能刪除資料、看得到回收桶入口**；`member` 可以新增/編輯所有資料，但看不到刪除按鈕。沒有 `role` 欄位的話系統會當作 `member` 處理。
   - 第一個帳號（管理員自己）也要照這個方式手動加進去，`role` 記得填 `admin`，否則自己登入後也會被擋、也刪不了東西。
   - `members` 這個子集合的文件只能由管理員手動在 Console 建立/編輯，網站本身無法自行寫入（安全規則已鎖死），避免有人繞過白名單或自己把自己升級成管理員。

## 權限、操作紀錄與回收桶

- **角色權限**：一般成員（`member`）能新增/編輯任何資料，但看不到刪除按鈕；管理員（`admin`）才能刪除。這個限制同時在前端（隱藏按鈕）跟 Firestore 規則（伺服器端擋下）兩層都有做，不是只靠前端隱藏。
- **操作紀錄**：首頁「近期活動紀錄」會顯示誰在什麼時候新增/編輯/刪除/復原了什麼，記錄一旦寫入就不能被竄改或刪除（連管理員也不行）。
- **資源回收桶**：管理員登入後，右上角使用者資訊旁會多一個垃圾桶圖示，點開可以看到所有被刪除的資料，能「復原」或「永久刪除」。刪除其實是「軟刪除」（標記隱藏，不是真的從資料庫移除），超過 30 天沒處理的項目，下次有人打開回收桶時會自動永久清除——這不是精確的排程（免費方案沒有伺服器排程功能），是「回收桶被打開時才觸發」的近似做法。

完成以上設定後執行 `npm run dev`，用 Google 登入並開始使用。
