# 🚀 Quick Actions Guide - EcoMarket NGO Dashboard

## Overview
The **Quick Actions** section on the NGO Dashboard provides easy access to important features for managing donations and tracking impact. These are the 4 main action buttons:

---

## 1. 🔍 Browse Items
**What it does:** Takes you to the marketplace to search for sale items

**How to use:**
1. Click **"Browse Items"** button
2. You'll be taken to `marketplace.html`
3. Browse available items for purchase or sale
4. Filter by category, price, or search keywords
5. View item details and decide if you want to purchase for your community

**Who uses it:** NGOs who want to purchase items for their programs

**Related page:** `marketplace.html`

---

## 2. 📋 View Requests
**What it does:** Shows all pending donation requests from donors to your NGO

**Location:** `view-requests.html`

### What You'll See:
- **Pending Requests** - Donations waiting for your response
- **Accepted Requests** - Donations you've already accepted
- **Rejected Requests** - Donations you declined

### Actions You Can Take:
- **Accept** a donation → Item is confirmed for your NGO
  - ✅ Your "Items Received" counter increases
  - ✅ Your "Impact Score" increases by 10 points
  
- **Reject** a donation → Item is not needed
  - ❌ No counter increase
  
- **View Item** → See full details of the donation

### Quick Example:
```
Donor posts: "Old Laptop - Good condition"
           ↓
You see it in "Available Donations" on NGO Dashboard
           ↓
You click "Claim This Item"
           ↓
Claim shows as "Pending" in View Requests
           ↓
Donor reviews your NGO and decides to Accept/Reject
           ↓
You see status update in View Requests
```

---

## 3. 🗺️ Update Needs
**What it does:** Tell donors what items your NGO needs for community programs

**Location:** `update-needs.html`

### What You Can Set:
1. **Item Categories Needed:**
   - Electronics & Gadgets
   - Furniture
   - Clothing & Textiles
   - Books & Learning Materials
   - Toys & Games
   - Sports Equipment
   - Kitchen Items
   - Bedding & Linens

2. **Urgency Level:**
   - High - Needed ASAP
   - Medium - Within 2 weeks
   - Low - Whenever available

3. **Additional Details:**
   - Describe your programs
   - Explain what you'll do with the items
   - Set quality requirements (e.g., "Good to Excellent condition only")

4. **Contact Person:**
   - Name of someone donors can reach out to

### How Donors Use This Information:
- Donors see your NGO's profile
- They see what items you need
- They prioritize donating items that help your mission
- This increases your donation claims and impact!

### Example:
```
Your NGO: Education for Underprivileged Children
You set needs: Books, Laptops, School Supplies (High Urgency)
           ↓
Donor has old books and laptops to donate
           ↓
Donor sees your needs match what they have
           ↓
Donor donates to you specifically (instead of someone else)
           ↓
Your metrics increase!
```

---

## 4. 📊 Generate Report
**What it does:** Create detailed reports about your NGO's impact and achievements

**Location:** `generate-report.html`

### Report Types Available:

#### A. **Impact Summary Report** 📈
Shows:
- Total Donations Claimed
- Items Actually Received
- Total Impact Score
- Pending Requests
- Key Achievements

**Use for:** Board meetings, funding applications, annual reports

#### B. **Detailed Donation Report** 📝
Shows:
- List of all accepted donations
- Donor names
- Dates received
- Item details

**Use for:** Inventory tracking, donor thank-you letters

#### C. **Activity Timeline** ⏰
Shows:
- Chronological history of all claims
- Acceptance/rejection decisions
- All interactions with donors

**Use for:** Progress tracking, impact documentation

#### D. **Environmental Impact Report** 🌍
Shows:
- Carbon emissions reduced (kg CO₂)
- Waste diverted from landfills (kg)
- Environmental impact metrics
- Sustainability achievements

**Use for:** Sustainability reports, grant proposals, environmental initiatives

### How Impact is Calculated:
- **Per item:** 2.5 kg CO₂ reduced + 15 kg waste diverted
- **Per 10 items:** 25 kg CO₂ + 150 kg waste prevented

### Download Options:
- All reports can be downloaded as PDF
- Ready to print and share
- Professional formatting for presentations

---

## 📱 Complete Workflow Example

### Scenario: Education NGO Starting Their Journey

**Day 1: Setup Your Profile**
1. NGO registers on EcoMarket
2. Goes to **Update Needs**
3. Selects: Books, Laptops, School Supplies
4. Sets urgency: High
5. Adds details: "We serve 100 students ages 6-16"

**Day 2-3: Search for Items**
1. Donors see your needs on NGO Dashboard
2. Donor #1 (has old laptop) → **Donates to your NGO**
3. You see it in **View Requests** (Pending)
4. You review it and click **Accept**

**Metrics Update:**
```
Before:
- Donations Claimed: 0
- Items Received: 0
- Impact Score: 0
- Pending Requests: 0

After Accept:
- Donations Claimed: 1 (when you claimed)
- Items Received: 1 ✅ (when donor approved)
- Impact Score: 10 ✅ (10 points per accepted item)
- Pending Requests: 0 (resolved)
```

**Day 4: Track Your Impact**
1. Go to **Generate Report**
2. View **Impact Summary** → Shows 1 item, 10 points
3. View **Environmental Impact** → Shows 2.5 kg CO₂ saved
4. Download report for your website or donors!

---

## 🎯 Quick Tips

### To Increase "Items Received":
✅ Update your needs clearly → Donors know exactly what to give you
✅ Accept donations when donors offer them → Don't leave them pending
✅ Build reputation → More donors will choose your NGO

### To Increase "Impact Score":
✅ Focus on accepting donations (not just claiming)
✅ Claim more items in marketplace
✅ Have donors accept your claims

### To Keep "Pending Requests" Low:
✅ Respond quickly to donations
✅ Accept or reject within 2-3 days
✅ Communicate with donors about their offers

### For Best Reports:
✅ Keep your needs updated (seasonal changes)
✅ Set realistic urgency levels
✅ Add detailed descriptions of your programs
✅ Generate monthly reports to track progress

---

## 🔗 Page Navigation Map

```
NGO Dashboard (ngo-dashboard.html)
    ├── Browse Items → marketplace.html
    ├── View Requests → view-requests.html
    │   └── [Manage pending/accepted donations]
    ├── Update Needs → update-needs.html
    │   └── [Tell donors what you need]
    └── Generate Report → generate-report.html
        ├── Impact Summary
        ├── Detailed Report
        ├── Timeline
        └── Environmental Impact
```

---

## 📞 Support & Contact

For issues or questions about:
- **Donations:** Use View Requests
- **Your Profile:** Use Update Needs  
- **Progress Tracking:** Use Generate Report
- **Finding Items:** Use Browse Items

Contact: info@ecomarket.com

---

## Key Metrics Explained

| Metric | What It Means | How to Increase |
|--------|---------------|-----------------|
| **Donations Claimed** | Total requests made by your NGO | Click "Claim" on more items |
| **Items Received** | Actual accepted donations | Have donors accept your claims |
| **Impact Score** | Environmental/social impact points (10 per item) | Receive more accepted donations |
| **Pending Requests** | Claims awaiting donor decision | Accept/reject donations faster |

---

## 💡 Pro Tips

1. **Weekly Review:** Check View Requests weekly and respond to pending claims
2. **Monthly Updates:** Update your needs monthly to stay current
3. **Quarterly Reports:** Generate reports for stakeholder updates
4. **Seasonal Planning:** Adjust urgency levels based on community needs
5. **Share Impact:** Use reports to show donors your real impact

---

**Last Updated:** December 2024
**Version:** 1.0
