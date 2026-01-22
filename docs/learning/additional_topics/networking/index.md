---
title: Networking
description: How the internet actually works.
tags:
  - Networking
  - System Design
  - Interview
---

# Networking

Understanding the pipes that connect our systems.

---

## The OSI Model (Mental Model vs Reality)

| Layer | Name | Protocol Examples | Unit | Function |
| :--- | :--- | :--- | :--- | :--- |
| 7 | Application | HTTP, DNS, SSH | Data | Network process to application |
| 4 | Transport | TCP, UDP, QUIC | Segment | Host-to-host communication |
| 3 | Network | IP, ICMP, BGP | Packet | Path determination and IP (Logical addressing) |
| 2 | Data Link | Ethernet, Wi-Fi | Frame | Physical addressing (MAC) |
| 1 | Physical | Fiber, Copper | Bit | Media, signal, and binary transmission |

---

## TCP vs UDP

### TCP (Transmission Control Protocol)

- **Reliable**: Guarantees delivery and order.
- **Connection-oriented**: 3-way handshake (SYN, SYN-ACK, ACK).
- **Flow Control**: Prevents sender from overwhelming receiver.
- **Congestion Control**: Prevents sender from overwhelming the network.
- **Use Case**: Web (HTTP), Email, File Transfer.

### UDP (User Datagram Protocol)

- **Unreliable**: Fire and forget. No guarantees.
- **Connectionless**: No handshake.
- **Fast**: Low overhead.
- **Use Case**: Video streaming, VoIP, Gaming, DNS.

---

## DNS (Domain Name System)
The phonebook of the internet.

1.  **Browser**: Checks local cache.
2.  **OS**: Checks `/etc/hosts` and OS cache.
3.  **Resolver (ISP)**: Asks Root Server -> TLD Server (.com) -> Authoritative Server (google.com).
4.  **A Record**: Maps name to IPv4.
5.  **CNAME**: Maps name to name (alias).

---

## HTTP/HTTPS

### Versions

- **HTTP/1.1**: Text-based, Keep-Alive, Head-of-Line blocking.
- **HTTP/2**: Binary, Multiplexing (multiple requests over one connection), Header Compression (HPACK).
- **HTTP/3 (QUIC)**: Built on UDP. Solves TCP Head-of-Line blocking. Faster handshake.

### HTTPS (TLS/SSL)

- **Encryption**: Nobody can read the data.
- **Integrity**: Nobody can modify the data.
- **Authentication**: You are talking to who you think you are.
- **Handshake**: Exchange keys to establish a symmetric session key.
