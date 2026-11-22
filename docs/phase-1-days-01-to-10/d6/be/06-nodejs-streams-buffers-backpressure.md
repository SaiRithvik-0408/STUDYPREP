# Day 6: Backend Engineering & Node.js Streams, Buffers & Backpressure

In backend applications processing multi-gigabyte log files, video uploads, or massive CSV exports, loading files with `fs.readFile()` crashes the server with `JavaScript heap out of memory`.

This manuscript details how Node.js manages binary memory and high-throughput streams with zero memory bloat.

---

## 1. Buffers: Raw Memory Allocated Outside V8

JavaScript has no native 8-bit integer binary byte arrays. Node.js implements the `Buffer` class:

* Buffers are allocated in raw C++ memory via `malloc()` **outside the V8 Heap**.
* They do not count toward V8's `--max-old-space-size` memory limits.
* Each element in a Buffer represents a single octet (byte: 0 to 255 in decimal, `00` to `ff` in hexadecimal).

```typescript
const buf = Buffer.from('Node.js', 'utf-8');
console.log(buf); // <Buffer 4e 6f 64 65 2e 6a 73>
console.log(buf.length); // 7 bytes
```

---

## 2. Streams: Processing Data Chunk by Chunk

Instead of buffering an entire 5GB file into RAM, a **Stream** processes data chunk by chunk (default buffer size: 64KB for binary streams, 16 objects for object-mode streams):

```
[ 5GB File on Disk ] ──(64KB Chunk)──► [ Node Process RAM (~30MB) ] ──(64KB Chunk)──► [ HTTP Response ]
```

### The 4 Core Stream Types:
1. **Readable**: Source of data (`fs.createReadStream`, incoming HTTP `req`).
2. **Writable**: Destination for data (`fs.createWriteStream`, outgoing HTTP `res`).
3. **Duplex**: Both Readable and Writable (e.g. TCP Net Socket).
4. **Transform**: Duplex stream that modifies data as it passes through (e.g. `zlib.createGzip`, crypto hashing).

---

## 3. Backpressure: The Production Killer

### What is Backpressure?
Backpressure occurs when the **data source produces data faster than the destination can consume it**.
* Imagine reading from a fast NVMe SSD at 800 MB/s and piping the data to a slow mobile user downloading over 3G at 100 KB/s.
* If unmanaged, the unwritten 64KB chunks accumulate in memory buffers on the Node.js process until RAM fills up and the process crashes!

### Why `stream.pipe()` is an Anti-Pattern:
`readable.pipe(writable)` does **not** handle error cleanup properly. If an error occurs midway through streaming:
* The streams do not close automatically.
* File descriptors remain open, leaking OS resources until the server runs out of file descriptors (`EMFILE: too many open files`).

### The Production Standard: `node:stream/promises` -> `pipeline`
`pipeline` automatically monitors write buffer fullness, pauses the reader when the buffer fills (backpressure), and guarantees that all streams are destroyed if an error occurs.

```typescript
import fs from 'node:fs';
import zlib from 'node:zlib';
import { pipeline } from 'node:stream/promises';

export async function compressLargeFile(sourcePath: string, targetPath: string): Promise<void> {
  const readStream = fs.createReadStream(sourcePath);
  const gzipStream = zlib.createGzip();
  const writeStream = fs.createWriteStream(targetPath);

  try {
    // pipeline handles backpressure automatically!
    await pipeline(readStream, gzipStream, writeStream);
    console.log(`Compression successful: ${sourcePath} -> ${targetPath}`);
  } catch (error) {
    console.error('Pipeline failed:', error);
    throw error;
  }
}
```
