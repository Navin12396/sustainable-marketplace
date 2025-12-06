# NGO Dashboard Metrics - Quick Reference

## 📊 Metrics Overview

```
┌─────────────────────────────────────────────────────┐
│          NGO DASHBOARD METRICS                       │
├─────────────────────────────────────────────────────┤
│  Items Received: [Count of accepted donations]     │
│  Donations Claimed: [Total claims made]            │
│  Total Impact Score: [Items × 10 points]           │
│  Pending Requests: [Waiting for donor approval]    │
└─────────────────────────────────────────────────────┘
```

## 🔄 Metrics Flow Diagram

```
DONOR CREATES DONATION
         ↓
    ┌────────────┐
    │ Item Ready │
    │  For NGO   │
    └────────────┘
         ↓
   [Appears in NGO Dashboard Available Donations]
         ↓
    ┌──────────────────────┐
    │ NGO CLICKS "CLAIM"   │ → Donations Claimed +1
    │                      │ → Pending Requests +1
    └──────────────────────┘
         ↓
   [Shows in Donor Dashboard]
         ↓
    ┌──────────────────────┐
    │ DONOR ACCEPTS/REJECTS│
    └──────────────────────┘
    ↙                      ↘
┌─────────────┐         ┌─────────────┐
│   ACCEPT    │         │   REJECT    │
│             │         │             │
│ Items +1    │         │ No change   │
│ Impact +10  │         │             │
│ Pending -1  │         │ Pending -1  │
└─────────────┘         └─────────────┘
```

## 🎯 How to Test - Step by Step

### Test Scenario: NGO Receives Donated Electronics

**1. Donor Side (Create Donation)**
```
URL: add-item.html
1. Fill in item details (e.g., "Old Laptop")
2. Set Price: 0 (Free)
3. Check "This is a donation"
4. Upload image
5. Click "List Item"
```

**2. NGO Dashboard (Claim Donation)**
```
URL: ngo-dashboard.html
1. Login as NGO
2. Scroll down to "Available Donations"
3. Find the "Old Laptop" item
4. Click "Claim This Item"
✓ Should see: "Donation claimed! Donor will be notified."
✓ Donations Claimed +1 (e.g., was 0, now 1)
✓ Pending Requests +1 (e.g., was 0, now 1)
```

**3. Donor Dashboard (Accept Claim)**
```
URL: dashboard.html
1. Login as Donor (who created the donation)
2. Scroll to "NGO Interests in Your Donations"
3. Find the NGO's claim for "Old Laptop"
4. Click "Accept"
✓ Should see: "Donation claim accepted!"
✓ Back on NGO Dashboard:
  - Items Received +1 (e.g., was 0, now 1) ✅
  - Total Impact Score +10 (e.g., was 0, now 10) ✅
  - Pending Requests -1 (e.g., was 1, now 0) ✅
```

## 📈 Expected Results After Full Test

| Metric | Initial | After Claim | After Accept |
|--------|---------|-------------|--------------|
| Donations Claimed | 0 | **1** | 1 |
| Pending Requests | 0 | **1** | **0** |
| Items Received | 0 | 0 | **1** |
| Total Impact Score | 0 | 0 | **10** |

## 🚀 Advanced Test Cases

### Test Case 1: Multiple Donations
1. Donor creates 3 donations
2. NGO claims all 3
   - Donations Claimed = 3
   - Pending Requests = 3
3. Donor accepts 2, rejects 1
   - Items Received = 2
   - Pending Requests = 1
   - Total Impact Score = 20 (2 × 10)

### Test Case 2: Multiple NGOs
1. Same donation claimed by 2 different NGOs
2. Both show as pending for donor
3. Donor accepts first NGO
4. First NGO: Items Received +1, Impact +10
5. Second NGO: Still pending, no change
6. Donor rejects second NGO
7. Second NGO: Pending Request removed

## 🔧 Technical Details

### What Changed in Code

1. **acceptNGOClaim() function**
   - Now increments `itemsReceived` when claim accepted
   - Increments `impactScore` by 10 points per accepted claim

2. **NGO Registration**
   - Initializes `donationsClaimed: 0` field

3. **Pending Requests Calculation**
   - Real-time query: `WHERE ngoId == currentUser.uid AND status == "pending"`
   - No hardcoded values

### Firebase Collections

**users collection (NGO fields):**
```
{
  itemsReceived: 2,          // Accepts donations count
  donationsClaimed: 5,       // Claims made
  impactScore: 20,           // itemsReceived × 10
  userType: "ngo"
}
```

**ngoInterests collection:**
```
{
  ngoId: "ngo_123",
  itemId: "item_456",
  status: "pending|accepted|rejected",
  donorId: "donor_789",
  createdAt: timestamp
}
```

## 📱 Mobile Testing Note

All metrics update in real-time. You can:
- Open NGO dashboard in one browser tab
- Accept claim in another browser tab
- Metrics in NGO dashboard update instantly

## ❓ Common Questions

**Q: Why is "Donations Claimed" different from "Items Received"?**
- **Donations Claimed** = How many times NGO clicked claim (requests made)
- **Items Received** = How many claims were accepted by donors (actual items)
- If NGO claims 5 but donor only accepts 2 → Claimed=5, Received=2

**Q: How much Impact Score does each donation add?**
- **10 points per accepted donation**
- Reject/pending donations don't add points
- Max impact = Items Received × 10

**Q: Do metrics reset?**
- No, they accumulate forever
- Perfect for tracking NGO's historical impact

**Q: Can NGO claim same item twice?**
- No, filtered out after claiming
- Each NGO can only have 1 pending claim per item
