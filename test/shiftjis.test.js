import assert from "assert"
import { Buffer } from "buffer"
import iconv from "../lib/index-node.js"

describe("ShiftJIS tests", function () {
  it("ShiftJIS correctly encoded/decoded", function () {
    var testString = "中文abc" // unicode contains ShiftJIS-code and ascii
    var testStringBig5Buffer = Buffer.from([0x92, 0x86, 0x95, 0xb6, 0x61, 0x62, 0x63])
    var testString2 = "測試"
    var testStringBig5Buffer2 = Buffer.from([0x91, 0xaa, 0x8e, 0x8e])

    assert.strictEqual(iconv.encode(testString, "shiftjis").toString("hex"), testStringBig5Buffer.toString("hex"))
    assert.strictEqual(iconv.decode(testStringBig5Buffer, "shiftjis"), testString)
    assert.strictEqual(iconv.encode(testString2, "shiftjis").toString("hex"), testStringBig5Buffer2.toString("hex"))
    assert.strictEqual(iconv.decode(testStringBig5Buffer2, "shiftjis"), testString2)
  })

  it("ShiftJIS extended chars are decoded, but not encoded", function () {
    var buf = Buffer.from("ed40eefceeef", "hex"); var str = "纊＂ⅰ"; var res = "fa5cfa57fa40" // repeated block (these same chars are repeated in the different place)
    var buf2 = Buffer.from("f040f2fcf940", "hex"); var str2 = ""; var res2 = "3f3f3f"   // non-repeated, UA block.

    assert.strictEqual(iconv.decode(buf, "shiftjis"), str)
    assert.strictEqual(iconv.decode(buf2, "shiftjis"), str2)

    assert.strictEqual(iconv.encode(str, "shiftjis").toString("hex"), res)
    assert.strictEqual(iconv.encode(str2, "shiftjis").toString("hex"), res2)
  })

  it("ShiftJIS decodes the whole EUDC block, but does not encode it", function () {
    // https://encoding.spec.whatwg.org/#shift_jis-decoder: pointers 8836 to 10715 (0xF040 to 0xF9FC)
    // decode to U+E000 to U+E757.
    for (var pointer = 8836; pointer <= 10715; pointer++) {
      var lead = Math.floor(pointer / 188)
      var trail = pointer % 188
      var bytes = Buffer.from([lead + (lead < 0x1F ? 0x81 : 0xC1), trail + (trail < 0x3F ? 0x40 : 0x41)])
      var char = String.fromCharCode(0xE000 + pointer - 8836)

      assert.strictEqual(iconv.decode(bytes, "shiftjis"), char, bytes.toString("hex"))
      assert.strictEqual(iconv.encode(char, "shiftjis").toString("hex"), "3f", bytes.toString("hex"))
    }
  })

  it("ShiftJIS includes extensions", function () {
    assert.strictEqual(iconv.decode(Buffer.from("8740", "hex"), "shiftjis"), "①")
    assert.strictEqual(iconv.encode("①", "shiftjis").toString("hex"), "8740")
  })
})
