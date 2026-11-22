# Day 17: Frontend Engineering & WebSockets Architecture

Unlike HTTP polling, WebSockets provide bi-directional, persistent TCP communication:

```typescript
export function useWebSocket(url: string) {
  useEffect(() => {
    let ws = new WebSocket(url);

    ws.onopen = () => console.log('WebSocket Connected');
    ws.onmessage = (event) => console.log('Message:', JSON.parse(event.data));
    
    // Heartbeat ping every 30 seconds
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'PING' }));
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [url]);
}
```