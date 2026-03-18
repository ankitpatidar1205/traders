# Notification System — Complete Reference

## 1. Notification Types (type field)

| Type      | Color  | Use When                                      |
|-----------|--------|-----------------------------------------------|
| `info`    | Blue   | General info — updates, announcements         |
| `warning` | Yellow | Caution — margin low, limits close            |
| `alert`   | Red    | Urgent — market close, carry forward ban      |
| `success` | Green  | Positive — KYC approved, deposit confirmed    |

---

## 2. Target / Visibility (target_role field)

| target_role   | Kon dekh sakta hai                         |
|---------------|--------------------------------------------|
| `ALL`         | SuperAdmin + Admin + Broker sabhi           |
| `SUPERADMIN`  | Sirf SuperAdmin                            |
| `ADMIN`       | Sirf Admin (apne panel me)                 |
| `BROKER`      | Sirf Broker (apne panel me)                |
| `target_user_id` | Ek specific user (kisi bhi role ka)     |

---

## 3. Notification Kahan Se Aati Hain

### A. MANUAL (Admin ya SuperAdmin bhejta hai)

| Kaun bhej sakta hai | Kahan se | Kya bhej sakta hai |
|---------------------|----------|--------------------|
| SuperAdmin | Notifications Page → Send Notification button | ALL / SUPERADMIN / ADMIN / BROKER |
| Admin | Notifications Page → Send Notification button | ALL / ADMIN / BROKER |

---

### B. AUTO (Backend automatically bhejta hai — future integration ke liye)

Ye events hone par automatically notification ban sakti hai:

#### SuperAdmin ko milni chahiye:
| Event | Type | Message Example |
|-------|------|-----------------|
| Naya Admin create hua | `info` | "New admin 'Rahul' created" |
| Admin ne login kiya | `info` | "Admin login from IP 192.168.1.1" |
| Fund request pending hai | `warning` | "5 fund requests pending approval" |
| System error / DB issue | `alert` | "Database connection failed" |

#### Admin ko milni chahiye:
| Event | Type | Message Example |
|-------|------|-----------------|
| Naya Broker create hua | `info` | "New broker 'Amit' added under you" |
| Naya Trader create hua | `info` | "New trading client registered" |
| KYC document submit hua | `warning` | "KYC pending for client Suresh" |
| Fund deposit request aai | `warning` | "Deposit request ₹50,000 from trader" |
| Withdrawal request aai | `warning` | "Withdrawal request ₹10,000 pending" |
| Trader ka M2M loss limit cross hua | `alert` | "Client auto square-off triggered" |

#### Broker ko milni chahiye:
| Event | Type | Message Example |
|-------|------|-----------------|
| Apna trader create hua | `info` | "New client added under you" |
| Client ne trade open kiya | `info` | "Client opened BUY GOLD" |
| Client margin low hai | `warning` | "Client margin below 30%" |
| Client auto square-off hua | `alert` | "Client position auto closed" |
| Fund request approve/reject hua | `success` / `alert` | "Fund request approved by admin" |

---

## 4. API Endpoints

| Method | URL | Kaam |
|--------|-----|------|
| `GET` | `/api/notifications` | Apni saari notifications fetch karo |
| `POST` | `/api/notifications` | Nayi notification bhejo |
| `PUT` | `/api/notifications/:id/read` | Ek notification read mark karo |
| `PUT` | `/api/notifications/read-all` | Sab read mark karo |
| `DELETE` | `/api/notifications/:id` | Notification delete karo |

### POST Body Example:
```json
{
  "title": "Market Close Tomorrow",
  "message": "NSE and MCX market will remain closed on account of Republic Day.",
  "type": "alert",
  "target_role": "ALL"
}
```

---

## 5. Real-Time (Socket.io Events)

| Event Name | Direction | When |
|------------|-----------|------|
| `join` | Client → Server | Login ke baad — user apna room join karta hai |
| `notification` | Server → Client | Jab koi nayi notification create hoti hai |
| `notification_deleted` | Server → Client | Jab koi notification delete hoti hai |

### Socket Rooms:
- `role:SUPERADMIN` — sabhi superadmins
- `role:ADMIN` — sabhi admins
- `role:BROKER` — sabhi brokers
- `user:123` — specific user (ID = 123)

---

## 6. Database Tables

### `notifications`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `title` | VARCHAR(255) | Notification heading |
| `message` | TEXT | Full message |
| `type` | ENUM | info / warning / alert / success |
| `target_role` | ENUM | SUPERADMIN / ADMIN / BROKER / ALL |
| `target_user_id` | INT | Specific user (NULL = all of target_role) |
| `created_by` | INT | Kisne banaya (user_id) |
| `created_at` | TIMESTAMP | Kab banaya |

### `notification_reads`
| Column | Type | Description |
|--------|------|-------------|
| `notification_id` | INT | Konsi notification |
| `user_id` | INT | Kisne read kiya |
| `read_at` | TIMESTAMP | Kab read kiya |

---

## 7. Frontend Components

| File | Kaam |
|------|------|
| `hooks/useNotifications.js` | API fetch + Socket.io real-time listener |
| `components/TopBar.jsx` | Bell icon — unread count badge + dropdown preview (6 notifications) |
| `pages/notifications/NotificationsPage.jsx` | Full list + Send Notification modal + Delete button |

---

## 8. Quick Flow Diagram

```
SUPERADMIN / ADMIN
      │
      ▼
 NotificationsPage
 [Send Notification]
      │
      ▼
 POST /api/notifications
      │
      ├──► DB insert (notifications table)
      │
      └──► Socket.io emit
               │
               ├──► role:ADMIN  → Admin ka bell icon update
               ├──► role:BROKER → Broker ka bell icon update
               └──► role:ALL    → Sab ko real-time update
```

---

## 9. Abhi Kya Kaam Karta Hai vs Future

| Feature | Status |
|---------|--------|
| Manual notification bhejno (SuperAdmin/Admin) | ✅ Ready |
| Role-based visibility | ✅ Ready |
| Real-time bell icon update (Socket.io) | ✅ Ready |
| Mark as read (single + all) | ✅ Ready |
| Delete notification | ✅ Ready |
| Auto notification on user create | 🔜 Future |
| Auto notification on KYC submit | 🔜 Future |
| Auto notification on fund request | 🔜 Future |
| Auto notification on M2M loss alert | 🔜 Future |
| Push notification (mobile/browser) | 🔜 Future |
