# Music Marshall — Platform Credentials & Architecture Documentation

## 1. Administrative Account
Use these credentials to access the **Admin Panel** where you can upload new songs, select release categories, manage catalog tracks, view registered members, and track referral codes:

| Field | Value |
|---|---|
| **Email** | `admin@marshall.com` |
| **Password** | `admin123` |
| **Role** | `admin` |
| **Referral Code** | `ADMIN-CORE` |

---

## 2. Playback Tiers & Categories

### Category A: "My MM Releases" (100% Free — No Login Needed)
- Available on the public **Landing Page** and in the Web App under **"My MM Releases"**.
- Anyone can click Play on any of the 16 downloaded official releases and listen immediately with zero restrictions or authentication prompt.
- Includes tracks by **Wayne Armond**, **Stevie Malekuu**, **Luciano**, **Yishka**, **Teacha Barnes**, and **The Greaves Brothers**.

### Category B: Extended VIP Catalog (Requires Account & Login)
- Unreleased studio dubs, acoustic stems, and custom user uploads.
- Guests can browse the titles, artists, and duration, but playback requires logging in.
- Registration strictly enforces a **compulsory referral code**.

---

## 3. Compulsory Referral Codes (For New User Registration)
Registration on Music Marshall is strictly invite-only:

| Referral Code | Description |
|---|---|
| `MARSHALL-VIP` | Official Music Marshall VIP Access |
| `SPOTIFY-2026` | Spotify Switcher Tier Code |
| `SOUND-ELITE` | High-Fidelity Master Code |

---

## 4. Audio & Song File Upload Feature
In the **Admin Panel** (`⚙️ Admin Panel` on the sidebar — visible only to admins):
- **Upload Audio Files**: Directly from your computer (`.mp3`, `.wav`, `.flac`, `.m4a`).
- **Release Category Selection**: Choose whether the song is published as a free **My MM Release** or an account-gated **VIP Vault** track.
- **Auto-Detection**: Extracts song duration and title automatically.
- **Cover Image Upload**: Upload custom cover artwork with live image preview.

---

## 5. Email Verification & Admin 2FA Security System

### For Members & Listeners:
1. **Registration Verification via Official SMTP**:
   - New members provide their username, email, password, and compulsory referral code.
   - Upon submitting, a cryptographic 6-digit OTP is automatically generated and dispatched directly to their registered email address via Gmail SMTP (`mymusicmarshall@gmail.com`).
   - The user checks their real email inbox and enters the 6-digit code in the **Email Verification Modal** to verify their address.
2. **Login Gating & Admin Approval**:
   - If an unverified user attempts to log in, Music Marshall intercepts and dispatches a fresh OTP to their email.
   - If a user is not yet approved by the administrator (`accountStatus: 'pending_approval'`), login is gated with a notification that administrator approval is required.
   - Once approved by the administrator on the Admin Panel, the user receives an official activation email and full player access is granted.

### For Administrators (`admin@marshall.com`):
1. **Direct Administrator Access (No 2FA Required)**:
   - Admin logging in with `admin@marshall.com` / `admin123` is granted direct immediate access to the platform and the **Admin Panel** without any 2FA prompts.
2. **Admin Panel Member Access & Promo Code Management**:
   - Admins can view and toggle member status between **Approved** (`✓ Approved`) and **Not Approved** (`⏳ Not Approved`).
   - Admins can click **"Approve & Send Activation Email"** to approve a member and automatically send their official VIP activation email.
   - Admins can **Revoke Approval / Mark Not Approved** or **Delete Members**.
   - Admins have full Promo Code CRUD: **Add new promo codes**, **Update/edit promo codes**, and **Delete promo codes** with instant persistence to localStorage.

---

## 6. Official SMTP & Admin Member Activation System

### Official SMTP Configuration:
- **Service**: Google Gmail SMTP (`smtp.gmail.com`)
- **Port**: `465` (SSL) / `587` (TLS)
- **Account / Username**: `mymusicmarshall@gmail.com`
- **Sender Name**: `"mymusicmarshall"`
- **App Password**: `lcqewvoepptbvpms`
- **Verification Endpoint**: `GET /api/test-smtp` (Status: Verified & Live)

### Two-Step Admin Confirmation Workflow:
1. **Member Registration**:
   - Listener signs up with email, username, password, and VIP referral code.
   - Listener enters 6-digit email confirmation OTP.
   - Upon OTP confirmation, account status is set to `pending_approval`.
   - The user is notified that the account is awaiting administrator review and confirmation.
   - An alert email is automatically routed to `mymusicmarshall@gmail.com`.
2. **Admin Portal Confirmation & SMTP Dispatch**:
   - Admin logs into the **Admin Panel** (`admin@marshall.com`).
   - The **"Pending Member Activations"** section lists pending listeners.
   - Admin clicks **"📧 Approve & Send Activation Email"**.
   - The server connects to Gmail SMTP using `mymusicmarshall@gmail.com` and dispatches the luxury HTML activation confirmation email directly to the user.
   - The member's account status updates to **Active** (`approved`).
3. **Launch Music Lab Gated Access**:
   - Public visitors can stream all 16 **My MM Releases** without login.
   - However, clicking **"Launch Music Lab"** requires a registered, approved account.
   - Once activated by the Admin, the user can log in and enter the full Spotify-style Music Lab!



