import struct

with open('ebayjaco_mmarshalldb_2026-10-08_17-54-39', 'rb') as f:
    buf = f.read()

print(f"File size: {len(buf):,} bytes ({len(buf)/8192:.2f} pages)")

# In MS SQL Server .bak files, the backup contains headers and then 8KB data blocks aligned or offset.
# Let's search for SQL server page headers:
# A data page starts with m_headerVersion (0x01), m_type (0x01 = DATA, 0x02 = INDEX), m_typeFlagBits, m_level, m_flagBits, ...
# Page header is 96 bytes:
# struct {
#   uint8_t m_headerVersion; // 1
#   uint8_t m_type; // 1 = data
#   uint8_t m_typeFlagBits;
#   uint8_t m_level;
#   uint16_t m_flagBits;
#   uint16_t m_indexId;
#   uint32_t m_prevPageId; ...
#   uint32_t m_pageId;
#   uint32_t m_objId; // object ID!
#   uint16_t m_slotCnt; // number of rows!
# }

# Let's find pages by searching for potential page offsets
# SQL server backup usually has 512-byte or 8192-byte tape blocks.
# Let's test alignment
pages_found = []
for offset in range(0, len(buf) - 8192, 512):
    header = buf[offset:offset+96]
    m_headerVersion = header[0]
    m_type = header[1]
    if m_headerVersion == 1 and m_type in [1, 2]: # DATA or INDEX
        # check m_slotCnt at offset 24 or 36
        # Let's inspect potential m_objId and m_slotCnt
        obj_id = struct.unpack('<I', header[24:28])[0]
        slot_cnt = struct.unpack('<H', header[22:24])[0]
        pages_found.append((offset, m_type, obj_id, slot_cnt))

print(f"Total candidate pages found: {len(pages_found)}")
for p in pages_found[:20]:
    print(f"Offset {p[0]:8x} ({p[0]:8d}): type={p[1]}, obj_id={p[2]}, slot_cnt={p[3]}")
