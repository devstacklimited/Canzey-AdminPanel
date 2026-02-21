# Draws API – Flutter Guide

Public endpoint to show the **Prize Draws** screen in the Flutter app.  
No authentication required.

---

## Endpoint

```
GET https://admin.canzey.com/api/draws
```

---

## Response Structure

```json
{
  "success": true,
  "active":   [ ...draw objects ],
  "upcoming": [ ...draw objects ],
  "past":     [ ...draw objects ]
}
```

| Array | Meaning | Flutter Tab |
|-------|---------|------------|
| `active` | Tickets still being sold — draw hasn't happened yet | **"Active"** or **"Live"** |
| `upcoming` | Sold out / expired — waiting for winner to be announced | **"Ready for Draw"** |
| `past` | Winner already chosen | **"Past Results"** |

---

## `active` — Live Draws

Prizes where tickets are **still being sold** and no winner has been picked.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Prize record ID |
| `product_id` | int | Product ID |
| `campaign_id` | int | Campaign/Prize ID |
| `product_name` | string | Name of the product |
| `product_image` | string | Relative image URL — prepend base URL |
| `product_description` | string\|null | Product description |
| `campaign_title` | string | Campaign/prize title |
| `campaign_image` | string\|null | Campaign cover image URL |
| `tickets_required` | int | Total tickets to trigger a draw |
| `tickets_remaining` | int | Tickets still available to buy |
| `countdown_start_tickets` | int\|null | Show countdown when remaining ≤ this value |
| `draw_date` | datetime\|null | Scheduled draw date. `null` → "Draw date announced shortly" |
| `prize_end_date` | datetime\|null | Hard deadline. `null` = no deadline |
| `campaign_end_at` | datetime\|null | Campaign end date |
| `ticket_price` | string | Price per ticket (e.g. `"10.00"`) |
| `credits_per_ticket` | int | Credits earned per ticket purchase |

### Example

```json
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
  "ticket_price": "10.00",
  "credits_per_ticket": 50
}
```

### Flutter UI Tips

```dart
// Progress bar
final int sold = draw['tickets_required'] - draw['tickets_remaining'];
final double progress = sold / draw['tickets_required']; // 0.0 → 1.0

// Draw date label
String drawLabel = draw['draw_date'] != null
    ? 'Draw: ${formatDate(draw['draw_date'])}'
    : 'Draw date announced shortly';

// Countdown
final bool showCountdown =
    draw['tickets_remaining'] <= (draw['countdown_start_tickets'] ?? 0);

// Image URL
final String imageUrl = 'https://admin.canzey.com${draw['product_image']}';
```

---

## `upcoming` — Ready for Draw

Prizes that are **sold out or expired** and are waiting for the winner to be announced. No winner yet.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Prize record ID |
| `product_id` | int | Product ID |
| `campaign_id` | int | Campaign/Prize ID |
| `product_name` | string | Name of the product |
| `product_image` | string | Relative image URL |
| `product_description` | string\|null | Product description |
| `campaign_title` | string | Campaign/prize title |
| `campaign_image` | string\|null | Campaign cover image |
| `tickets_required` | int | Total tickets |
| `tickets_remaining` | int | `0` if sold out |
| `draw_date` | datetime\|null | Scheduled draw date. `null` → "Draw date announced shortly" |
| `prize_end_date` | datetime\|null | Prize deadline (if applicable) |
| `campaign_end_at` | datetime\|null | Campaign expiry date |
| `use_end_date` | int | `1` = campaign uses end date, `0` = no end date |

### Example

```json
{
  "id": 2,
  "product_id": 4,
  "campaign_id": 1,
  "product_name": "PS5 Console",
  "product_image": "/uploads/products/product-789.jpg",
  "product_description": "Sony PlayStation 5 Digital Edition",
  "campaign_title": "Gaming Giveaway",
  "campaign_image": "/uploads/campaigns/campaign-001.jpg",
  "tickets_required": 50,
  "tickets_remaining": 0,
  "draw_date": "2026-02-25T18:00:00.000Z",
  "prize_end_date": "2026-02-20T00:00:00.000Z",
  "campaign_end_at": null,
  "use_end_date": 0
}
```

### Flutter UI Tips

```dart
// Why is it in upcoming?
final bool isSoldOut    = draw['tickets_remaining'] == 0;
final bool isPrizeEnded = draw['prize_end_date'] != null &&
    DateTime.parse(draw['prize_end_date']).isBefore(DateTime.now());
final bool isCampEnded  = draw['use_end_date'] == 1 &&
    draw['campaign_end_at'] != null &&
    DateTime.parse(draw['campaign_end_at']).isBefore(DateTime.now());

// Status label
String status = isSoldOut ? 'SOLD OUT' : 'EXPIRED';

// Draw date label
String drawLabel = draw['draw_date'] != null
    ? 'Draw: ${formatDate(draw['draw_date'])}'
    : 'Draw date announced shortly';
```

---

## `past` — Past Results

Prizes where the **winner has been chosen** and announced.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Prize record ID |
| `product_id` | int | Product ID |
| `campaign_id` | int | Campaign/Prize ID |
| `product_name` | string | Name of the product |
| `product_image` | string | Relative image URL |
| `product_description` | string\|null | Product description |
| `campaign_title` | string | Campaign/prize title |
| `campaign_image` | string\|null | Campaign cover image |
| `tickets_required` | int | Total tickets that were sold |
| `tickets_remaining` | int | Tickets remaining at draw time |
| `draw_date` | datetime\|null | Scheduled draw date |
| `prize_end_date` | datetime\|null | Prize deadline |
| `winner_ticket` | string | Winning ticket number (e.g. `TKT-AB12C-XY99Z`) |
| `winner_name` | string | Winner's name — **privacy masked** (e.g. `"Ahmed K."`) |
| `draw_completed_at` | datetime | When the winner was officially announced |

### Example

```json
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
  "draw_completed_at": "2026-01-31T20:05:33.000Z"
}
```

### Flutter UI Tips

```dart
// Congratulations card
Text('🏆 ${draw['winner_name']} won ${draw['product_name']}!')

// Winning ticket
Text('Ticket: ${draw['winner_ticket']}')

// Draw date
Text('Draw completed: ${formatDate(draw['draw_completed_at'])}')
```

---

## Full Flutter Service

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

const String baseUrl = 'https://admin.canzey.com';

class DrawsService {
  Future<Map<String, List<dynamic>>> fetchDraws() async {
    final response = await http.get(Uri.parse('$baseUrl/api/draws'));

    if (response.statusCode != 200) {
      throw Exception('Failed to load draws');
    }

    final data = jsonDecode(response.body);

    return {
      'active':   List<dynamic>.from(data['active']  ?? []),
      'upcoming': List<dynamic>.from(data['upcoming'] ?? []),
      'past':     List<dynamic>.from(data['past']    ?? []),
    };
  }

  String imageUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    return '$baseUrl$path';
  }

  String drawDateLabel(String? drawDate) {
    if (drawDate == null) return 'Draw date announced shortly';
    final date = DateTime.parse(drawDate).toLocal();
    return 'Draw: ${date.day} ${_month(date.month)} ${date.year}';
  }

  String _month(int m) =>
      ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];
}
```

---

## State Logic Summary

| Condition | `tickets_remaining` | Has winner | Array |
|-----------|---------------------|-----------|-------|
| Tickets still available | `> 0` | ❌ | `active` |
| All tickets sold | `0` | ❌ | `upcoming` |
| Prize end date passed | any | ❌ | `upcoming` |
| Campaign end date passed | any | ❌ | `upcoming` |
| Winner announced | any | ✅ | `past` |

---

## Image URLs

All `product_image` and `campaign_image` values are **relative paths**. Always prefix with the base URL:

```
https://admin.canzey.com/uploads/products/product-123.jpg
https://admin.canzey.com/uploads/campaigns/campaign-456.jpg
```
