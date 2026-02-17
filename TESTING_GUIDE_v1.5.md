# BridgeContext v1.5.0 - Testing Guide

## 🧪 Manual Testing Instructions

### Step 1: Load the Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select this folder: `C:\Users\anves\Downloads\Develop\ContextAI`
6. The extension should appear with version **1.5.0**

---

### Step 2: Test Search Functionality

**Test Case 1: Basic Search**
1. Click the BridgeContext extension icon
2. You should see a search bar at the top with placeholder: "🔍 Search contexts by name, description, or content..."
3. Create a few test context packs:
   - Name: "React Hooks Guide", Description: "Best practices for hooks"
   - Name: "Python Data Analysis", Description: "Pandas and NumPy tips"
   - Name: "API Design", Description: "RESTful API patterns"

**Test Case 2: Search Filtering**
1. Type "React" in the search bar
2. ✅ Only the "React Hooks Guide" pack should be visible
3. ✅ Results count should show "1 result found"
4. ✅ The matching pack should have a highlighted border (purple)
5. Clear the search
6. ✅ All packs should reappear

**Test Case 3: Search by Tags**
1. Add tags to a pack (see tagging tests below)
2. Search for a tag name
3. ✅ Packs with that tag should appear

---

### Step 3: Test Tagging System

**Test Case 1: Add Pre-defined Tags**
1. Click "+ New Context Pack"
2. Fill in Name and Description
3. Click in the "Add tags..." field
4. Type "Rea"
5. ✅ Dropdown should appear showing "React"
6. Click "React" from suggestions
7. ✅ A purple tag chip should appear above the input with "React ×"
8. Type "Pyt"
9. ✅ "Python" should appear in suggestions
10. Click "Python"
11. ✅ Both tags should be visible as chips

**Test Case 2: Add Custom Tags**
1. In the tag input, type "MyCustomTag"
2. Press **Enter**
3. ✅ "MyCustomTag" should be added as a chip
4. ✅ Custom tags work the same as pre-defined tags

**Test Case 3: Remove Tags**
1. Click the **×** on any tag chip
2. ✅ Tag should be removed immediately
3. ✅ Tag should disappear from the chip list

**Test Case 4: Tags Display on Cards**
1. Save a pack with tags
2. ✅ Tags should appear below the description on the pack card
3. ✅ Tags should be small purple badges

**Test Case 5: Tags Persist**
1. Create a pack with tags
2. Close and reopen the extension
3. ✅ Tags should still be there
4. Edit the pack
5. ✅ Tags should appear in the modal

---

### Step 4: Test Usage Analytics

**Test Case 1: Initial Stats Display**
1. Open the extension popup
2. Scroll to the bottom (footer area)
3. ✅ You should see a purple gradient box with stats
4. ✅ Should show "Total Saved: 0" and "This Month: 0"

**Test Case 2: Stats Update on Save**
1. Create a new context pack with tags (e.g., "React", "Work")
2. Save it
3. ✅ Stats should immediately update to "Total Saved: 1" and "This Month: 1"
4. Create another pack with tag "React"
5. ✅ Stats should update to "Total Saved: 2" and "This Month: 2"

**Test Case 3: Top Tags Display**
1. Create 3+ packs with various tags
2. Use "React" tag on 2+ packs
3. ✅ "Top Tags" section should appear in stats
4. ✅ Should show "React (2)" or similar
5. ✅ Tags should be sorted by usage count

**Test Case 4: Stats Persist**
1. Close and reopen the extension
2. ✅ Stats should still show correct counts
3. ✅ Top tags should still be displayed

---

### Step 5: Integration Testing

**Test Case 1: Search + Tags Integration**
1. Create pack with name "API Guide" and tag "Backend"
2. Search for "Backend"
3. ✅ Pack should appear (searching by tag)
4. Search for "API"
5. ✅ Pack should appear (searching by name)

**Test Case 2: Bridge Context with Analytics**
1. Go to ChatGPT or Claude
2. Have a conversation
3. Click extension icon → "Bridge Context"
4. Name it and save
5. ✅ Stats should increment
6. ✅ Pack should be searchable

**Test Case 3: Edit Pack Preserves Tags**
1. Create a pack with tags
2. Edit the pack (click ✏️ button)
3. ✅ Tags should appear in the modal
4. Add another tag
5. Save
6. ✅ All tags should be preserved

---

## 🐛 Common Issues & Solutions

### Issue: Search not working
- **Check**: Open browser console (F12)
- **Look for**: JavaScript errors
- **Solution**: Reload extension

### Issue: Tags not saving
- **Check**: Browser console for errors
- **Verify**: `analytics.js` is loaded (check Sources tab)
- **Solution**: Clear extension data and reload

### Issue: Stats showing "Stats unavailable"
- **Check**: Console for errors
- **Verify**: `BridgeAnalytics` is defined (type in console)
- **Solution**: Reload extension

### Issue: Dropdown not appearing
- **Check**: CSS is loaded properly
- **Verify**: `.tag-suggestions` class exists
- **Solution**: Hard refresh extension

---

## ✅ Expected Results Summary

After testing, you should verify:

- [x] Search bar is visible and functional
- [x] Search filters packs in real-time
- [x] Results count displays correctly
- [x] Tag input shows autocomplete dropdown
- [x] Pre-defined tags can be selected
- [x] Custom tags can be added via Enter
- [x] Tags display on pack cards
- [x] Tags can be removed with × button
- [x] Stats display in footer
- [x] Stats update when saving packs
- [x] Top tags appear after multiple saves
- [x] All features work together seamlessly

---

## 📸 What to Look For

### Search Bar
```
┌─────────────────────────────────────────┐
│ 🔍 Search contexts by name, descrip... │
└─────────────────────────────────────────┘
           2 results found
```

### Tag Input (with suggestions)
```
┌─────────────────────────────────────────┐
│ [React ×] [Python ×]                    │
│ Add tags (e.g. React, Python, Work)...  │
├─────────────────────────────────────────┤
│ React                                   │
│ TypeScript                              │
│ JavaScript                              │
└─────────────────────────────────────────┘
```

### Stats Display
```
┌─────────────────────────────────────────┐
│        12          3                    │
│   TOTAL SAVED  THIS MONTH               │
│                                         │
│   TOP TAGS                              │
│   React (5)  Python (4)  Work (3)       │
└─────────────────────────────────────────┘
```

---

## 🎬 Next Steps After Testing

1. If all tests pass → Ready for Phase 2 (Monetization)
2. If issues found → Report them and we'll fix
3. Record demo video showing features
4. Prepare Reddit post with screenshots

**Version**: 1.5.0
**Date**: February 17, 2026
