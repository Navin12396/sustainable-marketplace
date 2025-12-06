# NGO Dashboard Metrics Guide

## How to Increase Each Metric

### 1. **Donations Claimed** 📊
- **What it means:** Total number of donation items the NGO has requested/claimed
- **How to increase it:**
  1. Go to **NGO Dashboard** → **Available Donations** feed
  2. Browse donation items from donors
  3. Click **"Claim"** button on a donation item
  4. The **Donations Claimed** counter increases by 1
  5. The donation moves to **Pending** status

**Current Count:** Updates immediately when claim button clicked

---

### 2. **Pending Requests** ⏳
- **What it means:** Number of donation claims waiting for donor approval
- **How to increase it:**
  1. When NGO claims a donation → status set to **"pending"**
  2. Pending request is shown to the donor in their **User Dashboard**
  3. Donor can **Accept** or **Reject** the claim

**How to decrease it:**
- Donor accepts the claim → Pending → Accepted
- Donor rejects the claim → Pending → Rejected

**Current Count:** Automatically calculated from `ngoInterests` collection where status = "pending"

---

### 3. **Items Received** ✅
- **What it means:** Total number of donations ACCEPTED by donor (actual items in NGO's possession)
- **How to increase it:**
  1. NGO claims a donation (claim becomes "Pending")
  2. Donor opens their **User Dashboard**
  3. In "NGO Interests in Your Donations" section → Donor clicks **"Accept"**
  4. Status changes to **"Accepted"**
  5. **Items Received** counter increases by 1
  6. **Total Impact Score** increases by 10 points

**Current Count:** Updates when donor accepts a claim

---

### 4. **Total Impact Score** 🌍
- **What it means:** Environmental/social impact points earned from accepted donations
- **Calculation:** Each accepted donation = **10 impact points**
- **How to increase it:**
  1. NGO claims donation
  2. Donor accepts the claim in their dashboard
  3. **1 accepted donation = +10 impact points**
  4. Impact score increases automatically

**Current Count:** Auto-calculated when donor accepts claims

---

## Complete Flow to Test Metrics

### Step 1: Donor Perspective
1. **Create donation item** via "Add Item" page
2. Set as **Donation** (free item)
3. Item appears in NGO Dashboard available donations

### Step 2: NGO Perspective
1. Go to **NGO Dashboard**
2. View available donations feed
3. Click **"Claim"** on a donation
   - ✅ **Donations Claimed** increases by 1
   - ✅ **Pending Requests** increases by 1

### Step 3: Donor Accepts
1. Go to **User Dashboard**
2. Scroll to "NGO Interests in Your Donations" section
3. Click **"Accept"** for the NGO's claim
   - ✅ **Items Received** increases by 1 (NGO side)
   - ✅ **Total Impact Score** increases by 10 (NGO side)
   - ✅ **Pending Requests** decreases by 1 (NGO side)

### Alternative: Donor Rejects
1. Go to **User Dashboard**
2. Click **"Reject"** for the NGO's claim
   - ✅ **Pending Requests** decreases by 1
   - ❌ **Items Received** does not increase
   - ❌ **Impact Score** does not increase

---

## Metrics Database Structure

All metrics stored in Firebase **users** collection under NGO's document:

```json
{
  "uid": "ngo_user_id",
  "userType": "ngo",
  "name": "NGO Name",
  "donationsClaimed": 5,        // Claims made by NGO
  "itemsReceived": 3,           // Accepted claims (actual items)
  "impactScore": 30,            // Items Received × 10
  "...other fields"
}
```

Pending requests tracked separately in **ngoInterests** collection:

```json
{
  "ngoId": "ngo_user_id",
  "itemId": "item_id",
  "status": "pending",          // pending | accepted | rejected
  "donorId": "donor_id",
  "createdAt": "timestamp"
}
```

---

## Summary Table

| Metric | Increases When | Decreases When | Source |
|--------|---|---|---|
| **Donations Claimed** | NGO clicks "Claim" | Never | users.donationsClaimed |
| **Pending Requests** | NGO claims donation | Donor accepts/rejects | ngoInterests (status=pending) count |
| **Items Received** | Donor accepts claim | Never | users.itemsReceived |
| **Total Impact Score** | Donor accepts claim | Never | users.impactScore |

---

## Current Implementation Details

✅ **What's Working:**
- Donations Claimed increments on claim
- Pending Requests shows real-time count
- Items Received increments on acceptance
- Impact Score increments on acceptance (10 pts per donation)

✅ **What's Automatic:**
- All metrics update instantly
- No manual refresh needed
- Real-time Firebase updates

✅ **Firestore Rules:**
- NGOs can only see their own metrics
- Donors can only see their own interests
- Only authorized users can read/write
