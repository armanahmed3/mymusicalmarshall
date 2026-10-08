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

### Category B: Extended Member Catalog (Requires Account & Login)
- Unreleased studio dubs, acoustic stems, and custom user uploads.
- Guests can browse the titles, artists, and duration, but playback requires logging in.
- Registration enforces referral codes: (Membership is by referral only).

---

## 3. Referral Codes (For New User Registration)
Registration on Music Marshall is by referral only:

| Referral Code | Description |
|---|---|
| `MARSHALL-2026` | Official Music Marshall Referral Access |
| `SPOTIFY-2026` | Spotify Switcher Tier Code |
| `SOUND-ELITE` | High-Fidelity Master Code |

---

## 4. Audio & Song File Upload Feature
In the **Admin Panel** (`⚙️ Admin Panel` in the navigation — visible only to admins):
- **Upload Audio Files**: Directly from your computer (`.mp3`, `.wav`, `.flac`, `.m4a`).
- **Release Category Selection**: Choose whether the song is published as a free **My MM Release** or an account-gated **Master Sound Vault** track.
- **Auto-Detection**: Extracts song duration and title automatically.
- **Cover Image Upload**: Upload custom cover artwork with live image preview.

---

## 5. Direct Streamlined Authentication (No 2FA / No Email Confirmation Complexity)

### For Members & Listeners:
1. **Direct Instant Registration**:
   - New members provide their First Name, Last Name (optional), email address, password, and referral code.
   - Upon clicking **"Complete Registration"**, their account is instantly activated and logged in directly.
   - No OTP email confirmation, no 2FA codes, and no verification modals.
2. **Direct Instant Sign In**:
   - Members log in with their email address and password for immediate, unrestricted access.
   - Zero authentication roadblocks or 2FA complexity.

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



