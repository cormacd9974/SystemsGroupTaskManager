import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeRegex } from "./index.js";

test("escapeRegex escapes regex special characters", () => {
    assert.equal(escapeRegex("a.b*c"), "a\\.b\\*c");
});

test("escapeRegex neutralises a RedDos payload", () => {
    const input = "(a+)+";
    const escaped = escapeRegex(input);
    assert.equal(escaped, "\\(a\\+\\)\\+");
});

test("escapeRegex leaves plain text untouched", () => {
    assert.equal(escapeRegex("hello world"), "hello world");
});