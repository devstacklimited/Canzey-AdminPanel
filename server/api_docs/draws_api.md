# Draws API – Flutter Guide

Public endpoint to show the **Prize Draws** screen in the Flutter app.

## Base URL

```
https://admin.canzey.com/api/draws
```

**Authentication:** Not required (public)

---

## GET /api/draws

Returns all draws grouped into 3 categories:

| Category | Description |
|----------|-------------|
| `active` | Live draws — tickets still being sold |
| `upcoming` | Ready to draw — sold out or expired, winner not yet picked |
| `past` | Completed draws — winner already announced |

### Request

```http
GET https://admin.canzey.com/api/draws
```

No headers or body required.

---

### Response Example

```json
{
  "success": true,
  "active": [
    {
      "id": 3,
      "product_id": 5,
      "campaign_id": 2,
      "product_name": "iPhone 16 Pro Max",
      "product_image": "/uploads/products/product-123.jpg",
      "product_description": "Latest iPhone with titanium frame",
      "campaign_title": "Tech Giveaway March",
      "campaign_image": "/uploads/campaigns/campaign-456.jpg",
      "tickets_required": 100,
      "tickets_remaining": 37,
      "countdown_start_tickets": 20,
      "draw_date": "2026-03-01T13:00:00.000Z",
      "prize_end_date": null,
      "campaign_end_at": null,
      "use_end_date": 0,
      "ticket_price": "10.00",
      "credits_per_ticket": 50
    }
  ],
  "upcoming": [
    {
      "id": 2,
      "product_id": 4,
      "campaign_id": 1,
      "product_name": "PS5 Console",
      "product_image": "/uploads/products/product-789.jpg",
      "product_description": "Sony PlayStation 5",
      "campaign_title": "Gaming Giveaway",
      "campaign_image": "/uploads/campaigns/campaign-001.jpg",
      "tickets_required": 50,
      "tickets_remaining": 0,
      "draw_date": "2026-02-25T18:00:00.000Z",
      "prize_end_date": "2026-02-20T00:00:00.000Z",
      "campaign_end_at": null,
      "use_end_date": 0
    }
  ],
  "past": [
    {
      "id": 1,
      "product_id": 2,
      "campaign_id": 1,
      "product_name": "MacBook Pro M3",
      "product_image": "/uploads/products/product-321.jpg",
      "product_description": "Apple MacBook Pro with M3 chip",
      "campaign_title": "January Giveaway",
      "campaign_image": "/uploads/campaigns/campaign-100.jpg",
      "tickets_required": 200,
      "tickets_remaining": 0,
      "draw_date": "2026-01-31T20:00:00.000Z",
      "prize_end_date": null,
      "winner_ticket": "TKT-AB12C-XY99Z",
      "winner_name": "Ahmed K.",
      "draw_completed_at": "2026-01-31T20:05:00.000Z"
    }
  ]
}
```

---

## Field Reference

### Common Fields (all categories)

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Prize record ID (`product_prizes.id`) |
| `product_id` | integer | ID of the product being given away |
| `campaign_id` | integer | ID of the campaign/prize |
| `product_name` | string | Name of the product |
| `product_image` | string | URL of product image |
| `product_description` | string | Product description |
| `campaign_title` | string | Title of the campaign/prize |
| `campaign_image` | string | Campaign cover image URL |
| `tickets_required` | integer | Total tickets needed to trigger draw |
| `tickets_remaining` | integer | Tickets left (`0` = sold out) |
| `draw_date` | datetime\|null | Scheduled draw date. `null` → show "Draw date announced shortly" |
| `prize_end_date` | datetime\|null | Hard deadline for the prize |

### Active-only Fields

| Field | Type | Description |
|-------|------|-------------|
| `countdown_start_tickets` | integer | Show countdown when this many tickets remain |
| `ticket_price` | string | Price per ticket in currency |
| `credits_per_ticket` | integer | Credits earned per ticket purchase |
| `campaign_end_at` | datetime\|null | Campaign end date |
| `use_end_date` | boolean | Whether campaign uses end date |

### Past-only Fields

| Field | Type | Description |
|-------|------|-------------|
| `winner_ticket` | string | Winning ticket number (e.g. `TKT-AB12C-XY99Z`) |
| `winner_name` | string | Winner's name (privacy: last name shortened to first letter e.g. `Ahmed K.`) |
| `draw_completed_at` | datetime | When the draw was completed |

---

## Accessing Images

All image URLs are relative. Prepend the base URL:

```
https://admin.canzey.com/uploads/products/product-123.jpg
https://admin.canzey.com/uploads/campaigns/campaign-456.jpg
```

---

## Flutter Usage Examples

### Fetch All Draws

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> fetchDraws() async {
  final response = await http.get(
    Uri.parse('https://admin.canzey.com/api/draws'),
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to load draws');
  }
}

// Usage
final data = await fetchDraws();
final List active   = data['active'];    // Live draws
final List upcoming = data['upcoming'];  // Ready to pick
final List past     = data['past'];      // Winners announced
```

---

### Display Logic by Tab

```dart
// ACTIVE TAB — "Live Draws"
// Show: product_name, product_image, campaign_title
// Show: tickets_remaining / tickets_required (progress bar)
// Show: draw_date if set, else "Draw date announced shortly"
// Show: prize_end_date if set (countdown timer)
// Show: ticket_price, credits_per_ticket

// UPCOMING TAB — "Coming Soon" / "Ready to Draw"  
// Show: product_name, product_image, campaign_title
// Show: "SOLD OUT" badge (tickets_remaining == 0)
// Show: draw_date if set, else "Draw date announced shortly"

// PAST TAB — "Past Winners"
// Show: product_name, product_image, campaign_title
// Show: winner_name (already privacy-masked e.g. "Ahmed K.")
// Show: winner_ticket
// Show: draw_completed_at (formatted date)
```

---

### Progress Bar (Active Draws)

```dart
// Calculate sold percentage for progress bar
final int totalTickets    = draw['tickets_required'];
final int remaining       = draw['tickets_remaining'];
final int sold            = totalTickets - remaining;
final double progress     = sold / totalTickets;  // 0.0 to 1.0

// Show countdown when tickets_remaining <= countdown_start_tickets
final bool showCountdown  = remaining <= (draw['countdown_start_tickets'] ?? 0);
```

---

### Draw Date Display

```dart
String drawDateLabel(String? drawDate) {
  if (drawDate == null) return 'Draw date announced shortly';
  final date = DateTime.parse(drawDate);
  return 'Draw: ${DateFormat('MMM d, yyyy – h:mm a').format(date)}';
}
```

---

## Draw Categories Summary

| State | `tickets_remaining` | Has winner | Appears in |
|-------|---------------------|-----------|------------|
| Live — tickets available | `> 0` | No | `active` |
| Sold out — awaiting draw | `= 0` | No | `upcoming` |
| Prize expired — awaiting draw | Any | No | `upcoming` |
| Draw completed | Any | ✅ Yes | `past` |
