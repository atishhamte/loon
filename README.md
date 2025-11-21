# LOON (LLM Optimised Object Notations)

[![npm version](https://img.shields.io/npm/v/loon.svg)](https://www.npmjs.com/package/loon)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

**LOON** is an encoder-only library that reduces token consumption by ~40-50% compared to minified JSON. It's designed specifically for LLM communication where every token counts.

The format removes unnecessary syntax, uses unquoted strings where safe, and employs schema optimization for arrays – all while remaining readable enough for LLMs to understand naturally.

## Installation

```bash
npm install loon
```

## Usage

```typescript
import { encode } from 'loon';

// Encode JavaScript data to LOON format
const data = {
  users: [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' },
    { id: 3, name: 'Charlie', role: 'user' },
  ],
};

const loon = encode(data);
console.log(loon);
// {users:[{id,name,role}:1,Alice,admin;2,Bob,user;3,Charlie,user]}
```

### With LLMs

```typescript
import { encode } from 'loon';

const context = {
  conversation: [
    { role: 'user', message: 'What is the weather?' },
    { role: 'assistant', message: 'It is sunny today.' },
  ],
  settings: { temperature: 0.7, maxTokens: 150 },
};

const prompt = `Context: ${encode(context)}\n\nQuestion: Summarize the conversation.`;
// Send to LLM...
```

## Format Comparison

### Example: User Data

**JSON (formatted):**

```json
{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "user" },
    { "id": 3, "name": "Charlie", "role": "user" }
  ]
}
```

**236 characters** (includes newlines and spaces)

**JSON.stringify (minified):**

```json
{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "user" },
    { "id": 3, "name": "Charlie", "role": "user" }
  ]
}
```

**126 characters**

**TOON:**

```
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Charlie,user
```

**69 characters** (45.2% vs minified)

**LOON:**

```
{users:[{id,name,role}:1,Alice,admin;2,Bob,user;3,Charlie,user]}
```

**64 characters** (49.2% vs minified) - Single line, better for LLMs

## Benchmarks

| Data Type               | JSON (formatted) | Minified   | TOON      | LOON      | LOON Savings |
| ----------------------- | ---------------- | ---------- | --------- | --------- | ------------ |
| Simple objects          | 236 chars        | 126 chars  | 69 chars  | 64 chars  | **49.2%** ✓  |
| API responses           | 520 chars        | 277 chars  | 179 chars | 161 chars | **41.9%** ✓  |
| Database records        | 414 chars        | 293 chars  | 186 chars | 176 chars | **39.9%** ✓  |
| Time series (5 items)   | 547 chars        | 325 chars  | 149 chars | 139 chars | **57.2%** ✓  |
| Large arrays (20 items) | 1985 chars       | 1384 chars | 750 chars | 707 chars | **48.9%** ✓  |
| Mixed data types        | 192 chars        | 122 chars  | 109 chars | 100 chars | **18.0%** ✓  |

**Average: 42.5% compression vs minified JSON**

**LOON advantages:**

✅ Single-line format (better for LLMs and APIs)

✅ 42.5% average compression vs minified JSON

✅ Handles mixed/nested structures efficiently

✅ No newlines (saves tokens)

## API

### `encode(value: unknown): string`

Encodes a JavaScript value into LOON format.

**Example:**

```typescript
const data = { name: 'Alice', age: 30 };
const loon = encode(data);
// {name:Alice;age:30}
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/loon.git
cd loon
npm install

# Build
npm run build

# Lint and format
npm run lint
npm run format
```

## License

[MIT](./LICENSE) License © 2025-PRESENT

---

**Questions or feedback?** Open an issue on [GitHub](https://github.com/YOUR_USERNAME/loon/issues).
