# DATAMARK – API CONTRACT (MVP)

**Formato:** REST  
**Content-Type:** application/json  
**Base URL (local):** http://localhost:3000  

---

## Convenciones de Respuesta

### Éxito
```json
{
  "ok": true,
  "data": {}
}
```

### Error
```json
{
  "ok": false,
  "message": "Error message",
  "details": {}
}
```

---

## 1. Health Check

### GET /health

#### 200 OK
```json
{
  "ok": true,
  "data": {
    "status": "UP"
  }
}
```

---

## 2. Products

### GET /products

#### 200 OK
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "storeId": "uuid",
      "name": "Nike Air",
      "sku": "NK-001",
      "price": 1999.0,
      "stock": 10,
      "createdAt": "2026-02-20T00:00:00.000Z",
      "updatedAt": "2026-02-20T00:00:00.000Z"
    }
  ]
}
```

---

### GET /products/:id

#### 200 OK
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "storeId": "uuid",
    "name": "Nike Air",
    "sku": "NK-001",
    "price": 1999.0,
    "stock": 10,
    "createdAt": "2026-02-20T00:00:00.000Z",
    "updatedAt": "2026-02-20T00:00:00.000Z"
  }
}
```

#### 404 Not Found
```json
{
  "ok": false,
  "message": "Product not found"
}
```

---

### POST /products

#### Request
```json
{
  "storeId": "uuid",
  "name": "Nike Air",
  "sku": "NK-001",
  "price": 1999.0,
  "stock": 10
}
```

#### 201 Created
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "storeId": "uuid",
    "name": "Nike Air",
    "sku": "NK-001",
    "price": 1999.0,
    "stock": 10,
    "createdAt": "2026-02-20T00:00:00.000Z",
    "updatedAt": "2026-02-20T00:00:00.000Z"
  }
}
```

#### 400 Bad Request
```json
{
  "ok": false,
  "message": "Invalid payload",
  "details": {
    "field": "price"
  }
}
```

---

### PATCH /products/:id

#### Request
```json
{
  "price": 1899.0,
  "stock": 15
}
```

#### 200 OK
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "storeId": "uuid",
    "name": "Nike Air",
    "sku": "NK-001",
    "price": 1899.0,
    "stock": 15,
    "createdAt": "2026-02-20T00:00:00.000Z",
    "updatedAt": "2026-02-20T00:05:00.000Z"
  }
}
```

---

### DELETE /products/:id

#### 204 No Content

---

## 3. Sales

### POST /sales

#### Request
```json
{
  "storeId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "qty": 2
    },
    {
      "productId": "uuid",
      "qty": 1
    }
  ]
}
```

#### 201 Created
```json
{
  "ok": true,
  "data": {
    "saleId": "uuid",
    "storeId": "uuid",
    "total": 5997.0,
    "items": [
      {
        "productId": "uuid",
        "qty": 2,
        "unitPrice": 1999.0,
        "subtotal": 3998.0
      },
      {
        "productId": "uuid",
        "qty": 1,
        "unitPrice": 1999.0,
        "subtotal": 1999.0
      }
    ],
    "createdAt": "2026-02-20T00:00:00.000Z"
  }
}
```

#### 400 Bad Request (Items vacío)
```json
{
  "ok": false,
  "message": "Items cannot be empty"
}
```

#### 400 Bad Request (Cantidad inválida)
```json
{
  "ok": false,
  "message": "Invalid qty",
  "details": {
    "productId": "uuid",
    "qty": 0
  }
}
```

#### 409 Conflict (Stock insuficiente)
```json
{
  "ok": false,
  "message": "Insufficient stock",
  "details": [
    {
      "productId": "uuid",
      "requested": 3,
      "available": 1
    }
  ]
}
```

---

## 4. Dashboard

### GET /dashboard?storeId=uuid

#### 200 OK
```json
{
  "ok": true,
  "data": {
    "totalSales": 120,
    "revenue": 250000.0,
    "topProducts": [
      {
        "productId": "uuid",
        "name": "Nike Air",
        "qtySold": 20
      }
    ]
  }
}
```

#### 400 Bad Request
```json
{
  "ok": false,
  "message": "storeId is required"
}
```

---

## HTTP Status Codes Used

- 200 OK → Request successful
- 201 Created → Resource created
- 204 No Content → Resource deleted
- 400 Bad Request → Validation error
- 404 Not Found → Resource not found
- 409 Conflict → Business rule conflict (e.g., insufficient stock)

---

## Notas Finales

- Todas las respuestas son en formato JSON.
- Las fechas están en formato ISO 8601.
- Los identificadores son UUID.
- Las operaciones de venta son transaccionales.
