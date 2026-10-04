# Hack4Gov field notes — Patoo404

Independent study notes for a Jeopardy-style CTF: independent challenges grouped by category, with flags submitted for points.

The six challenge categories confirmed by Rance are cryptography, reverse engineering, digital forensics, steganography, web security, network security. Kali setup, Linux basics, web exploitation practice, and competition strategy support the review.

Run Kali Bash blocks in Kali’s Terminal and GDB prompt blocks inside the debugger after it launches. Use your Kali VM and assigned competition targets. Follow the organizer’s current scope, tool, team, scoring, and flag-format rules. REVIEW{...} flags are invented local practice answers. Filenames are examples unless the note creates them.

## 00 / Kali setup

Use Kali’s Terminal for blocks labeled Kali Bash. Run blocks labeled GDB prompt inside the debugger after it launches. Start with this chapter; later examples use supplied artifacts or clearly labeled local practice files. If Linux commands are new to you, start with 09: Linux basics.

### Install and verify a focused toolset

Do this during preparation, then test the tools and take a VM snapshot. Installed tools vary across Kali images.

**Kali Bash · preparation**

```bash
sudo apt update
sudo apt install file binutils coreutils curl python3 jq
sudo apt install nmap ffuf burpsuite wireshark tshark
sudo apt install libimage-exiftool-perl binwalk 7zip steghide
sudo apt install bind9-dnsutils whois

command -v file strings sha256sum curl python3
command -v nmap ffuf burpsuite tshark capinfos
command -v exiftool binwalk 7z steghide dig whois
```

apt update refreshes package indexes. apt install adds the named packages and may ask questions. command -v prints executable paths. Test missing tools individually rather than assuming every Kali installation includes them.

**What to look for:** Check local help before a challenge: nmap --help, ffuf -h, tshark -h, binwalk --help, and 7z -h. Tool versions can change options.

**Common traps**

- Do not start a rolling-release upgrade during the competition. Prepare and test beforehand.
- If APT asks about capture permissions, follow your lab setup; reading supplied PCAP files does not require live capture privileges.
- Avoid sudo pip install and --break-system-packages. Use packaged tools or an isolated environment.

**References:** [Kali update guidance](https://www.kali.org/docs/general-use/updating-kali/) · [Kali tool packages](https://www.kali.org/tools/kali-meta/) · [Kali Python isolation](https://www.kali.org/docs/general-use/python3-external-packages/)

### Preserve evidence before analysis

Use one folder per challenge. Put original downloads in original/ and do your analysis in work/.

**Kali Bash · example artifact**

```bash
mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}
cd ~/hack4gov-review/challenge-01
pwd
ls -lah original/

# First put the supplied artifact into original/.
# Replace artifact.bin with the actual filename.
sha256sum original/artifact.bin > results/original.sha256
cp -p original/artifact.bin work/
sha256sum work/artifact.bin
file work/artifact.bin
```

Matching digests confirm your starting copy has the same bytes. cp -p preserves available file attributes. Relative paths are resolved from the directory shown by pwd; quote a filename if it contains spaces.

**What to look for:** Record the prompt, scope, required flag format, filenames, and first observation. A digest tracks content changes; it does not prove that metadata or a claimed origin is genuine.

**Common traps**

- Commands referring to artifact.bin or capture.pcapng need your actual challenge filename.
- Do not edit the only original copy. Hash recovered objects too.

**References:** [GNU SHA-2 utilities](https://www.gnu.org/software/coreutils/manual/html_node/sha2-utilities.html) · [File identification](https://github.com/file/file/blob/master/doc/file.man)

### Run a tiny local web practice lab

This self-contained exercise creates a static clue trail on your own Kali VM. Its REVIEW{...} answer is invented for practice and is not the competition's flag format.

**Kali Bash · terminal 1**

```bash
mkdir -p ~/hack4gov-review/local-web/public
cd ~/hack4gov-review/local-web/public

cat > index.html <<'HTML'
<!doctype html>
<title>Local CTF practice</title>
<h1>Review lab</h1>
<!-- Practice clue: follow robots.txt -->
HTML

printf 'User-agent: *\nDisallow: /practice-note.txt\n' > robots.txt
printf 'REVIEW{read_the_response}\n' > practice-note.txt
python3 -m http.server 8000 --bind 127.0.0.1
```

Keep this terminal running. Binding to 127.0.0.1 keeps the exercise on the local machine. Press Ctrl+C in this terminal when finished. This simple server is for practice, not a production deployment.

**Kali Bash · terminal 2**

```bash
BASE_URL='http://127.0.0.1:8000'
curl -sS "$BASE_URL/"
curl -sS "$BASE_URL/robots.txt"
curl -sS "$BASE_URL/practice-note.txt"
```

Follow the page comment to robots.txt, then inspect the named practice file. You can also visit the URL in Kali's browser. Later /login, /profile, and /search examples require a separate assigned application; this static lab does not implement them.

**What to look for:** The final response is a practice answer. Explain which clue led to it rather than treating a tool's output as the whole solution.

**Common traps**

- If port 8000 is busy, pick a free port and update BASE_URL in both your commands and browser.
- A robots.txt path is a clue, not permission to access an unrelated system.

**Practice explanation:** The HTML comment points to robots.txt. Its practice path points to practice-note.txt, whose body contains REVIEW{read_the_response}. In a real challenge, confirm that path is inside the assigned scope and use the organizer's exact flag format.

**References:** [Python local HTTP server](https://docs.python.org/3/library/http.server.html) · [Robots protocol](https://datatracker.ietf.org/doc/html/rfc9309)

### Use an isolated Python workspace

Most examples here use Python's standard library and need no extra packages. Use a virtual environment when a specific practice tool needs dependencies.

**Kali Bash · optional Python environment**

```bash
sudo apt install python3-venv
mkdir -p ~/hack4gov-review/python-lab
cd ~/hack4gov-review/python-lab
python3 -m venv .venv
source .venv/bin/activate
python --version
python -m pip --version
# Follow the selected tool's official dependency instructions here.
deactivate
```

Activation selects the environment's Python. Use python -m pip inside it when official tool instructions require a package. deactivate returns to the normal shell environment.

**What to look for:** If you see externally-managed-environment, check whether you are using Kali's system Python. For standalone packaged tools, prefer APT; Kali also documents pipx.

**Common traps**

- A missing module and an unsupported Python version are different problems. Read the actual error.
- Keep a working installation and needed symbols available before an offline event.

**References:** [Kali Python packages](https://www.kali.org/docs/general-use/python3-external-packages/)

## 01 / Cryptography

Identify the representation, cipher, key material, or mathematical relationship before choosing a tool. Compare your recovered answer with the exact challenge format. Start with the small local exercises, then apply the method to supplied data.

### Select the challenge workspace

```bash
mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}
cd ~/hack4gov-review/challenge-01
pwd
ls -lah work/
```

Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence.

### Distinguish encoding, encryption, and hashing

Encoding changes representation; encryption uses a key; a hash is a digest rather than reversible text. Treat appearance as a hypothesis, then test one transformation.

**Kali Bash · offline Python examples**

```bash
python3 - <<'PY'
import base64, codecs, hashlib
from urllib.parse import unquote

print(base64.b64decode("SGVsbG8=", validate=True).decode("ascii"))
print(bytes.fromhex("48656c6c6f").decode("ascii"))
print(codecs.decode("Uryyb", "rot_13"))
print(unquote("%48%65%6c%6c%6f"))

ciphertext = bytes.fromhex("6b464f4f4c")
print(bytes(b ^ 0x23 for b in ciphertext).decode("ascii"))
print(hashlib.sha256(b"Hello").hexdigest())
PY
```

The first five outputs are Hello. The XOR example uses an explicitly supplied toy key, 0x23. The final line is a SHA-256 digest, not another encoding of printable Hello.

**What to look for:** Record the original bytes, transformation, parameters/key, output type, and why the result makes sense. Keep binary output as bytes until its format is known.

**Common traps**

- Base64 decoding returns bytes. UTF-8/ASCII interpretation is a separate step.
- Padding, a URL-safe alphabet, or binary output can explain decode errors.
- Do not hide errors with errors='ignore' or keep decoding without a reason.
- A hexadecimal string could represent bytes or a hash; length alone is not proof.

**References:** [Python Base64](https://docs.python.org/3/library/base64.html) · [Python bytes/hex](https://docs.python.org/3/library/stdtypes.html#bytes.fromhex) · [Python codecs](https://docs.python.org/3/library/codecs.html) · [Python URL quoting](https://docs.python.org/3/library/urllib.parse.html)

### Check exact bytes when comparing hashes

Case, whitespace, newline characters, and the text encoding change a digest. There is no general decode-hash command.

**Kali Bash · compare two inputs**

```bash
printf 'Hello' | sha256sum
printf 'Hello\n' | sha256sum
python3 - <<'PY'
import hashlib
print(hashlib.sha256(b"Hello").hexdigest())
PY
```

The first shell digest and the Python digest match. The second shell digest differs because its input includes a newline. printf makes the distinction explicit.

**What to look for:** If a challenge provides a hash and candidate data, compare hashes of exact candidate bytes. Save the algorithm and byte representation used.

**Common traps**

- Do not identify an algorithm solely from the digest's length.
- Hashing a filename string differs from hashing that file's contents.
- Do not publish a real password or credential as practice material.

**References:** [Python hashlib](https://docs.python.org/3/library/hashlib.html) · [GNU hash utilities](https://www.gnu.org/software/coreutils/manual/html_node/sha2-utilities.html)

### Practice a small decoding chain

This local drill creates a file with an intentionally encoded practice answer. Use file, strings, and a single Base64 transformation.

**Kali Bash · invented practice file**

```bash
mkdir -p ~/hack4gov-review/encoding-drill
cd ~/hack4gov-review/encoding-drill
printf '%s\n' 'UkVWSUVXe2VuY29kaW5nX2lzX25vdF9lbmNyeXB0aW9ufQ==' > clue.txt
file clue.txt
strings clue.txt
python3 - <<'PY'
from pathlib import Path
import base64
text = Path("clue.txt").read_text().strip()
print(base64.b64decode(text, validate=True).decode("ascii"))
PY
```

The original clue is text. Strip the file's line-ending whitespace before validating the Base64 alphabet. The output is a deliberately invented REVIEW{...} practice answer.

**What to look for:** Explain why this transformation fits the input, and preserve the input rather than only saving the final answer.

**Practice explanation:** The output is REVIEW{encoding_is_not_encryption}. Base64 is reversible representation, so no secret key is needed. This sample prefix belongs only to the local exercise; read the competition platform for its required flag format.

**References:** [Python Base64 validation](https://docs.python.org/3/library/base64.html)

### Classical cipher triage: frequency and repeated patterns

Count letters and compare word patterns before guessing the cipher or substituting letters.

**Kali Bash · invented local cryptography practice**

```bash
python3 - <<'PY'
from collections import Counter

cipher = 'ZIT LTEKTZ OL QZ ZIT GSR ZGVTK'
letters = [c for c in cipher.upper() if 'A' <= c <= 'Z']
words = cipher.split()

def pattern(word):
    seen = {}
    return '-'.join(str(seen.setdefault(c, len(seen))) for c in word)

print('letters:', len(letters))
print('top five:', Counter(letters).most_common(5))
print('repeated words:', [(w, n) for w, n in Counter(words).items() if n > 1])
print('word lengths:', [len(w) for w in words])
print('LTEKTZ pattern:', pattern('LTEKTZ'))
PY
```

Counter tallies letters; most_common(5) reports the five largest counts. Equal counts follow first appearance order. The pattern assigns a number when a new letter first appears, so the second and fifth positions in LTEKTZ match. In a simple one-to-one substitution, repeated letters and word shapes survive even though letter names change.

**What to look for:** The repeated three-letter word ZIT is a candidate for a common three-letter word, but the ciphertext alone does not establish which one. Try a tentative ZIT -> THE mapping, then check whether it remains consistent everywhere; never silently give one ciphertext symbol two different plaintext meanings. LTEKTZ and SECRET have the same 0-1-2-3-1-4 pattern. A whole-message consistency check is stronger than one plausible word.

**Common traps**

- A 24-letter sample is too short for reliable language-frequency conclusions; the most common letter is not automatically E.
- Spaces may be artificial. Polyalphabetic, homophonic, transposition, and binary ciphers require different hypotheses.
- This script measures clues; it does not automatically solve an arbitrary cipher.

**Practice explanation:** Expected output: letters: 24 · top five: [('Z', 5), ('T', 5), ('I', 2), ('L', 2), ('K', 2)] · repeated words: [('ZIT', 2)] · word lengths: [3, 6, 2, 2, 3, 3, 5] · LTEKTZ pattern: 0-1-2-3-1-4 This invented example was made with ABCDEFGHIJKLMNOPQRSTUVWXYZ -> QWERTYUIOPASDFGHJKLZXCVBNM. Its plaintext is THE SECRET IS AT THE OLD TOWER.

**References:** [Python collections.Counter and most_common](https://docs.python.org/3/library/collections.html#collections.Counter)

### Toy RSA: modular inverse and a round trip

Use supplied tiny primes to understand n, phi, e, d, and modular exponentiation; recover the invented integer message 42.

**Kali Bash · invented local cryptography practice**

```bash
python3 - <<'PY'
from math import gcd

p, q, e, m = 47, 59, 17, 42
n = p * q
phi = (p - 1) * (q - 1)
assert gcd(e, phi) == 1
assert 0 <= m < n
d = pow(e, -1, phi)
c = pow(m, e, n)
recovered = pow(c, d, n)
print('n:', n, 'phi:', phi, 'gcd:', gcd(e, phi))
print('d:', d, 'inverse check:', (e * d) % phi)
print('ciphertext:', c, 'recovered:', recovered)
PY
```

For the supplied distinct primes, n = p*q and phi = (p-1)*(q-1). gcd(e, phi) == 1 permits an inverse: d satisfies (e*d) % phi == 1. Python's built-in pow(e, -1, phi) computes that inverse; pow(m, e, n) computes m**e modulo n efficiently. Encryption produces c = 1466, and the matching private exponent recovers m = 42. RFC 8017 expresses the private-key inverse condition modulo lambda(n); using phi here also satisfies it because lambda(n) divides phi.

**What to look for:** The inverse check must print 1, and recovered must equal the original message integer. Challenge-provided p and q make this arithmetic possible; n by itself does not directly reveal phi. Treat 42 as an integer fixture. Recovering an integer and decoding a message's specified byte representation are separate steps.

**Common traps**

- Use Python 3.8 or later for negative-exponent modular pow. A non-coprime e and phi do not have a modular inverse.
- Use the built-in pow, not math.pow: math.pow converts operands to floating point and lacks the modulus argument.
- The phi formula used here requires distinct prime p and q; arbitrary or repeated factors change the problem.
- These deliberately tiny, unpadded parameters teach arithmetic. They are not a secure encryption implementation or evidence that correctly deployed RSA is easy to break.

**Practice explanation:** Expected output: n: 2773 phi: 2668 gcd: 1 · d: 157 inverse check: 1 · ciphertext: 1466 recovered: 42

**References:** [Python built-in pow](https://docs.python.org/3/library/functions.html#pow) · [Python math.gcd and math.pow](https://docs.python.org/3/library/math.html#math.gcd) · [RFC 8017: RSA key types and primitives](https://www.rfc-editor.org/rfc/rfc8017.html#section-3)

## 02 / Reverse engineering

Identify the binary format and architecture, inspect strings and references, and reconstruct the input checks. Use an isolated Kali lab for challenge binaries. Practice on the fully shown local examples before debugging supplied programs.

### Select the challenge workspace

```bash
mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}
cd ~/hack4gov-review/challenge-01
pwd
ls -lah work/
```

Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence.

### Start reversing with static inspection

Keep unknown binaries in a disposable lab VM. First determine format and architecture, then follow strings and references toward input checks.

1. In Ghidra, create a project and import the supplied binary. Check the detected format/architecture before analysis.
2. Search for relevant strings and follow their references.
3. Trace input, transformations, comparison constants, loops, and success/failure branches.
4. Rename useful variables/functions and compare the Listing with the Decompiler.

**Kali Bash · supplied ELF only**

```bash
file work/challenge
strings -a -n 5 work/challenge
readelf -hW work/challenge
readelf -SW work/challenge
readelf -sW work/challenge
readelf -p .rodata work/challenge
objdump -d -M intel work/challenge > results/disassembly.txt
```

readelf applies to ELF files. Inspect the header, sections, and symbols; .rodata must exist for that string-dump command. Intel syntax is appropriate for x86 disassembly, not every architecture.

**Kali Bash · optional Ghidra preparation**

```bash
sudo apt install ghidra
command -v ghidra
ghidra
```

Install and launch this optional GUI during preparation. Test the bundled Java/runtime setup before the event. The static ELF inspection commands above do not require Ghidra.

**What to look for:** Reconstruct a small condition you can explain. Decompiler output is an interpretation, not guaranteed original C source or exact types.

**Common traps**

- Stripped symbols and packed code can obscure structure.
- Wrong architecture, signedness, or byte order can change your interpretation.
- Do not run an unknown binary on your everyday host just to see what it does.

**References:** [GNU readelf](https://sourceware.org/binutils/docs/binutils/readelf.html) · [GNU objdump](https://sourceware.org/binutils/docs/binutils/objdump.html) · [Ghidra beginner guide](https://ghidra.re/ghidra_docs/GhidraClass/Beginner/Introduction_to_Ghidra_Student_Guide.html) · [Kali Ghidra package](https://www.kali.org/tools/ghidra/)

### Observe a byte transformation with GDB

A debugger can stop at a function and show memory before and after it runs. Practice with this fully shown local program in your Kali lab VM.

**Kali Bash · optional preparation before the event**

```bash
sudo apt install gdb build-essential
```

The gdb package supplies the debugger. build-essential supplies the C build prerequisites for this local drill. Prepare these before an offline event.

**Kali Bash · create and compile a known toy program**

```bash
mkdir -p ~/hack4gov-review/gdb-drill
cd ~/hack4gov-review/gdb-drill
cat > practice.c <<'C'
#include <stdio.h>

static void reveal(unsigned char *bytes) {
    for (int i = 0; i < 5; ++i)
        bytes[i] ^= 0x23;
}

int main(void) {
    unsigned char data[6] = {0x6b, 0x46, 0x4f, 0x4f, 0x4c, 0};
    reveal(data);
    puts((const char *)data);
    return 0;
}
C
gcc -g -O0 -Wall -Wextra -o practice practice.c
gdb -q ./practice
```

This source only transforms five local bytes and prints them. -g emits debugging information; -O0 limits optimization so the source variables are easier to inspect.

**GDB prompt · inspect the same buffer before and after**

```text
break reveal
run
x/5bx bytes
print/x bytes[0]
finish
x/s data
continue
quit
```

At reveal, x/5bx displays five bytes in hex: 6b 46 4f 4f 4c. The first byte is 0x6b. finish runs until reveal returns to main; x/s data then shows Hello. continue lets the program print Hello and exit.

**What to look for:** Connect the function's byte operation to the observed change. Record the breakpoint, buffer size, before/after values, and why the result matches the code.

**Common traps**

- run, step, next, finish, and continue execute the target. GDB is not a containment boundary; keep supplied unknown programs in an isolated lab.
- Missing symbols, optimization, or a different architecture can make source names and variables unavailable. This drill's function name is not a universal breakpoint.
- x/s expects a terminated string. Use a fixed byte count such as x/5bx when examining binary data.

**References:** [Kali GDB package](https://www.kali.org/tools/gdb/) · [Kali build-essential package](https://pkg.kali.org/pkg/build-essential) · [Debian build-essential prerequisites](https://packages.debian.org/stable/build-essential) · [GCC debug information](https://gcc.gnu.org/onlinedocs/gcc/Debugging-Options.html) · [GCC optimization options](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html) · [GDB breakpoints](https://sourceware.org/gdb/current/onlinedocs/gdb.html/Set-Breaks.html) · [GDB memory examination](https://sourceware.org/gdb/current/onlinedocs/gdb.html/Memory.html) · [GDB stepping and finish](https://sourceware.org/gdb/current/onlinedocs/gdb.html/Continuing-and-Stepping.html)

### Reconstruct a small byte check and verify the candidate

After tracing a program's input check, translate the exact operations into a small script. This invented check uses XOR, addition, and unsigned eight-bit wrapping.

**Kali Bash · offline Python reconstruction**

```bash
python3 - <<'PY'
target = bytes.fromhex("724d565653")

def check(candidate):
    transformed = bytes(((b ^ 0x23) + 7) & 0xff for b in candidate)
    return transformed == target

candidate = bytes(((t - 7) & 0xff) ^ 0x23 for t in target)
print(candidate.decode("ascii"))
print(check(candidate))
print(check(b"HELLO"))
PY
```

The output is Hello, True, then False. The observed forward check XORs each byte and then adds 7; reconstruction subtracts 7 first and then XORs. Replaying the forward check verifies the recovered bytes.

**What to look for:** Recover the input length, byte width, operation order, constants, and comparison from the program. Match the original check before treating a decoded-looking string as a solution.

**Common traps**

- The & 0xff mask models unsigned eight-bit wrapping. Signed arithmetic, larger integer widths, or a cast in another position can change the result.
- Not every check is invertible. A hash or a lossy operation needs a different approach.
- Hello is only this drill's candidate, not a competition flag. Preserve exact bytes and follow the real program's full acceptance conditions.

**References:** [Python bytes and hexadecimal conversion](https://docs.python.org/3/library/stdtypes.html#bytes.fromhex) · [Python integer bitwise operations](https://docs.python.org/3/library/stdtypes.html#bitwise-operations-on-integer-types)

## 03 / Digital forensics

Preserve the original artifact and investigate a copy. Identify file types, metadata, archives, logs, and memory evidence. Record file offsets, timestamps, hashes, and uncertainty so another person can reproduce the result.

### Select the challenge workspace

```bash
mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}
cd ~/hack4gov-review/challenge-01
pwd
ls -lah work/
```

Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence.

### Identify the bytes before trusting the extension

Begin with file signatures and readable strings. A file named image.jpg may contain another format or an embedded object.

**Kali Bash · supplied artifact copy**

```bash
file work/artifact.bin
sha256sum work/artifact.bin
strings -a -n 6 -t x work/artifact.bin > results/strings.txt
strings -a -e l work/artifact.bin > results/strings-utf16.txt
exiftool -a -u -g1 work/artifact.bin
binwalk work/artifact.bin
```

strings -a scans the full file; -n 6 sets the minimum length; -t x includes hex offsets; -e l searches 16-bit little-endian strings. ExifTool groups metadata; Binwalk highlights possible embedded signatures.

**What to look for:** Keep the format, architecture where relevant, offsets, unexpected metadata, and meaningful phrases. Validate signature hits by examining the recovered object's type.

**Common traps**

- Printable text can occur by chance and may be unrelated to the answer.
- Binwalk v2 and v3 differ; check local --help before copying extraction flags from a tutorial.
- Do not overwrite the original when experimenting.

**References:** [GNU strings](https://sourceware.org/binutils/docs/binutils/strings.html) · [ExifTool options](https://exiftool.org/exiftool_pod2.html) · [Kali Binwalk](https://www.kali.org/tools/binwalk/) · [Upstream Binwalk](https://github.com/ReFirmLabs/binwalk)

### Read image metadata as a clue

Use a supplied image copy. Compare camera metadata, embedded timestamps, GPS tags, and filesystem times without treating any one value as proof.

**Kali Bash · supplied image**

```bash
sha256sum work/challenge.jpg > results/image.sha256
exiftool -a -G1 -s work/challenge.jpg > results/metadata.txt
less results/metadata.txt
```

-a includes duplicate tags; -G1 identifies tag groups; -s prints tag names. Press q to exit less. The same-looking time in a File group and an EXIF group may have different meaning.

**What to look for:** Look for GPS coordinates, creator/software tags, descriptions, and time-zone information. If tags are absent, return to visual clues rather than assuming there is no answer.

**Common traps**

- Metadata can be removed, altered, or inherited during editing.
- Do not infer a time zone when the timestamp does not include one.
- A hash establishes which image you analyzed, not whether its metadata is truthful.

**References:** [ExifTool FAQ](https://exiftool.org/faq.html) · [ExifTool options](https://exiftool.org/exiftool_pod2.html)

### List, test, and extract an archive

Inspect the archive before extraction. Use a fresh working directory in your VM and re-run file triage on the recovered files.

**Kali Bash · supplied archive**

```bash
7z l work/bundle.zip
7z t work/bundle.zip
7z x work/bundle.zip -owork/extracted
find work/extracted -type f -exec file {} \;
```

l lists entries; t tests integrity; x extracts with directory structure. The -o switch takes its output folder directly. Let the tool prompt if the challenge provides an archive password.

**What to look for:** Look for misleading names, nested archives, small text files, and unexpected formats. Integrity success confirms extraction mechanics, not that every file is harmless.

**Common traps**

- Extract in a fresh location and inspect member paths first.
- If the archive is incomplete, check whether the prompt supplies additional parts.
- A protected archive is not automatically an instruction to perform a large password attack.

**References:** [Kali 7zip commands](https://www.kali.org/tools/7zip/)

### Turn a small log into a testable observation

This synthetic log uses a documentation IP. Practice counting failed actions and reading order, then apply the same method to supplied evidence.

**Kali Bash · invented local log**

```bash
mkdir -p ~/hack4gov-review/log-drill
cd ~/hack4gov-review/log-drill
cat > events.log <<'LOG'
2026-01-01T10:00:00Z 192.0.2.10 login FAIL
2026-01-01T10:00:04Z 192.0.2.10 login FAIL
2026-01-01T10:00:09Z 192.0.2.10 login OK
2026-01-01T10:00:12Z 192.0.2.10 download OK
LOG
grep ' login FAIL$' events.log
python3 - <<'PY'
from collections import Counter
from pathlib import Path
failures = Counter()
for line in Path("events.log").read_text().splitlines():
    timestamp, address, action, result = line.split()
    if action == "login" and result == "FAIL":
        failures[address] += 1
print(dict(failures))
PY
```

The count is {'192.0.2.10': 2}. The parser is deliberately tied to this four-field synthetic format; adapt it to the real log schema instead of assuming identical columns.

**What to look for:** Describe the observations: two failed logins, then a successful login, then a download from one address. The sequence alone does not establish who acted or whether it was malicious.

**Common traps**

- Account for time zones, missing records, rotated files, and shared IPs.
- Log fields may be quoted or contain spaces; a simple split parser is not universal.

**Practice explanation:** There are two FAIL entries for 192.0.2.10. A useful next question is whether the account, session, and downloaded object are related. Those facts are not present in this sample, so attribution would be speculation.

### Know the local environment and optional memory workflow

System inspection helps explain lab problems. Memory analysis is an optional extension: use a prepared Volatility 3 installation and the correct operating-system plugins.

**Kali Bash · inspect your own VM**

```bash
uname -a
cat /etc/os-release
ip -brief address
ss -ltn
ps -u "$USER"
```

These inspect your own OS, interfaces, listening TCP sockets, and processes. They do not enumerate an external target.

**Kali Bash · prepared upstream Volatility 3 lab**

```bash
# Run from the prepared Volatility 3 source directory.
python3 vol.py -h
python3 vol.py -f /path/to/supplied/memory.raw windows.info
python3 vol.py -f /path/to/supplied/memory.raw windows.pslist
python3 vol.py -f /path/to/supplied/memory.raw windows.netscan
```

The path is a placeholder. These plugins target Windows memory, even when the analysis runs on Kali. Correlate process IDs and network artifacts; do not apply Windows plugins to every image.

**What to look for:** Confirm image OS, tool compatibility, and symbols before interpreting output. Prepare symbol/dependency access before an offline event. For supplied container exercises, inspect image/configuration and files inside the isolated lab; container tools are supporting techniques, not a guaranteed category.

**Common traps**

- Kali lists Volatility/Volatility3 among removed tools, so do not assume apt install volatility3 will work.
- Follow the upstream installation guide; symbol preparation can require downloads.
- A process name alone is insufficient to identify malicious behavior.

**References:** [Volatility 3 Windows tutorial](https://volatility3.readthedocs.io/en/stable/getting-started-windows-tutorial.html) · [Kali removed tools](https://www.kali.org/docs/tools/removed-tools/)

### Corroborate an evidence clue with public sources

Extract distinctive words, signage, a document title, or a quoted sentence. Search the original source before widening the search.

1. Write the question you are trying to answer and list what is directly visible.
2. Use exact phrases and a domain filter when the challenge supplies a relevant source.
3. Open the original result and check whether it supports the exact claim.
4. Corroborate with another independent detail: layout, landmark, publication record, or timestamp.

**Search-engine box · not a terminal command**

```bash
"exact sentence supplied in the challenge"
site:challenge.example.invalid "distinctive phrase"
"distinctive phrase" -unrelated_keyword
```

Quotation marks target a phrase; site: limits a site/domain; a minus excludes a term. Replace the .invalid placeholder with the permitted source. Keep no space after site:. These are browser search queries, not Kali shell commands.

**What to look for:** A photo match should agree on stable visual details, not just a similar building. A matching username or name can belong to another person.

**Common traps**

- A search snippet is a lead. Read the underlying page.
- Two copies of the same article are not independent corroboration.
- Publication dates, update dates, and capture dates can describe different events.

**References:** [Google search operators](https://support.google.com/websearch/answer/2466433)

## 04 / Steganography

Identify the real carrier format before selecting a technique. Inspect metadata, visible content, embedded signatures, and structural anomalies. A suspicious clue guides your next test; it does not by itself prove a hidden flag.

### Select the challenge workspace

```bash
mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}
cd ~/hack4gov-review/challenge-01
pwd
ls -lah work/
```

Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence.

### Choose a steganography tool from the carrier type

Inspect file type, metadata, dimensions, and prompt hints first. For a supported carrier, Steghide can inspect or recover an embedded payload.

**Kali Bash · supported supplied image**

```bash
file work/image.jpg
exiftool -a -G1 -s work/image.jpg
steghide info work/image.jpg
steghide extract -sf work/image.jpg -xf results/recovered.bin
file results/recovered.bin
sha256sum results/recovered.bin
```

Steghide can prompt for a challenge-provided passphrase. Its common carrier formats are JPEG, BMP, WAV, and AU; it is not a universal PNG extractor.

**What to look for:** Follow the artifact type and hints. A recovered file may itself require decoding or archive analysis.

**Common traps**

- Absence of a Steghide payload does not rule out every steganography method.
- A metadata field is a clue, not necessarily a flag.
- Do not assume any visible picture has hidden data just because it is a CTF.

**References:** [Kali Steghide](https://www.kali.org/tools/steghide/)

### Inspect PNG structure before assuming hidden data

Identify the supplied image and inspect its metadata, strings, and chunks. Unusual structure or appended bytes are leads to investigate; they do not prove a hidden payload.

**Kali Bash · supplied PNG triage**

```bash
file work/image.png
exiftool -a -u -g1 work/image.png
strings -a -n 6 -t x work/image.png
binwalk work/image.png
```

Use the challenge's filename in place of image.png. These inspect type, metadata, printable strings with offsets, and signature matches. Normal PNG compression can produce zlib-related findings.

**Kali Bash · read-only PNG chunk inventory**

```bash
python3 - <<'PY'
from pathlib import Path
import zlib

blob = Path("work/image.png").read_bytes()
if blob[:8] != bytes.fromhex("89504e470d0a1a0a"):
    raise SystemExit("PNG signature mismatch")
offset = 8
while offset + 12 <= len(blob):
    size = int.from_bytes(blob[offset:offset + 4], "big")
    tag = blob[offset + 4:offset + 8]
    stop = offset + 12 + size
    if size > 0x7fffffff or stop > len(blob):
        raise SystemExit("Invalid or truncated chunk")
    stored = int.from_bytes(blob[stop - 4:stop], "big")
    actual = zlib.crc32(blob[offset + 4:stop - 4]) & 0xffffffff
    print(hex(offset), tag, size, "CRC matches:", stored == actual)
    offset = stop
    if tag == b"IEND":
        print("Bytes after IEND:", len(blob) - offset)
        break
else:
    raise SystemExit("No complete IEND chunk")
PY
```

PNG has an eight-byte signature followed by chunks with length, type, data, and CRC fields. The script follows declared lengths and checks each CRC over type plus data. It reports offsets, sizes, and any bytes after IEND.

**What to look for:** IHDR begins a PNG datastream, IDAT carries compressed image data, and IEND ends it. Text chunks and metadata can be legitimate. Correlate an interesting offset with the prompt and other evidence before extracting or decoding.

**Common traps**

- This inventory checks basic bounds and CRCs, not every PNG ordering rule or the decoded image. A matching CRC does not establish authenticity.
- Searching for the first literal IEND string is unreliable because those bytes can occur inside chunk data.
- Strings and Binwalk can miss pixel-level steganography. A clean result does not rule out hidden data; signature hits and trailing bytes are not proof by themselves.

**References:** [W3C PNG specification: signature and chunks](https://www.w3.org/TR/png/) · [Python CRC32](https://docs.python.org/3/library/zlib.html#zlib.crc32) · [GNU strings](https://sourceware.org/binutils/docs/binutils/strings.html) · [Kali ExifTool package](https://www.kali.org/tools/libimage-exiftool-perl/) · [Kali Binwalk documentation](https://www.kali.org/tools/binwalk/)

## 05 / Web security

Set a baseline before testing inputs. Observe methods, parameters, headers, cookies, and response content. Use only your local practice app or the assigned competition application.

### Select the challenge workspace

```bash
mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}
cd ~/hack4gov-review/challenge-01
pwd
ls -lah work/
```

Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence.

### Capture the actual HTTP response

Use the local lab from Kali setup to practice. In an assigned application, replace BASE_URL only with the provided in-scope origin.

**Kali Bash · GET baseline**

```bash
mkdir -p results
BASE_URL='http://127.0.0.1:8000'
curl -sS -D results/headers.txt -o results/body.html "$BASE_URL/"
cat results/headers.txt
less results/body.html
```

-sS hides the progress meter while keeping errors; -D writes headers; -o writes the body. This sends a GET. curl -I sends HEAD, which an application can handle differently.

**What to look for:** Read the status, Location, Content-Type, Set-Cookie, page title, and body. HTTP 200 can still contain a login page or a generic error. Inspect redirect destinations before following them.

**Common traps**

- A refused connection usually means the local server is not running or the port is wrong.
- Do not add -k as a default TLS workaround. Use the provided hostname/certificate setup.
- Keep every followed redirect within the assigned scope.

**References:** [curl tutorial](https://curl.se/docs/tutorial.html) · [HTTP status meanings](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

### Map visible clues before discovery

Browse normally and inspect source comments, links, forms, scripts, robots.txt, and sitemap.xml. Use a small discovery list only if the assigned lab allows it.

**Kali Bash · local clue files**

```bash
curl -sS "$BASE_URL/robots.txt"
curl -sS "$BASE_URL/sitemap.xml"
curl -sS "$BASE_URL/a-path-that-does-not-exist"
```

Compare a deliberately nonexistent path with interesting responses. The local setup lab has robots.txt but no sitemap.xml; a 404 for the latter is expected.

**Kali Bash · bounded discovery, if permitted**

```bash
printf '%s\n' robots.txt sitemap.xml help about > paths.txt
ffuf -w paths.txt -u "$BASE_URL/FUZZ" -t 2 -rate 2 \
  -maxtime 30 -mc all -o results/discovery.json -of json
```

FUZZ marks the replacement position. This example uses four paths, two workers, at most two requests per second, and a 30-second cap. Compare status, size, words, and lines; then verify meaningful results manually.

**What to look for:** An exposed script may reference a source map through a SourceMap header or sourceMappingURL comment. Inspect the map actually linked by the lab; resolve a relative URL against the script URL.

**Common traps**

- Wildcard/generic error responses can make every path look like a match.
- robots.txt describes crawler behavior and grants no testing authorization.
- Do not treat a framework name, version guess, or discovered path as a confirmed vulnerability.

**References:** [Kali ffuf options](https://www.kali.org/tools/ffuf/) · [Robots protocol](https://datatracker.ietf.org/doc/html/rfc9309) · [SourceMap header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/SourceMap)

### Observe and replay one request in Burp

Burp helps you inspect a request as a whole instead of guessing from the visible page.

1. Launch Burp, create a temporary practice project, and add only the assigned origin to target scope.
2. In Proxy → Intercept, open Burp's browser. Keep interception off while browsing; HTTP history still records traffic.
3. Turn interception on for one action, inspect the held request, and click Forward. Turn it off afterward.
4. In HTTP history, send a useful request to Repeater. Send the unchanged baseline first.
5. Change one input and compare status, headers, response body, and the expected access rules. Keep the method, session cookies, and required tokens.

**Kali Bash · start the GUI**

```bash
burpsuite
```

Use Burp's configured browser for the practice site. A page waiting to load may simply have a request held in Intercept.

**What to look for:** A useful record contains the baseline request, modified request, relevant response, and your conclusion. Mark a clue as suspected until a controlled comparison confirms it.

**Common traps**

- A proxy configuration problem is not an application vulnerability.
- A changed CSRF token or expired session can explain a different response.
- Do not forward a request to an out-of-scope origin.

**References:** [Burp target scope](https://portswigger.net/burp/documentation/desktop/getting-started/setting-target-scope) · [Burp interception](https://portswigger.net/burp/documentation/desktop/getting-started/intercepting-http-traffic) · [Burp Repeater](https://portswigger.net/burp/documentation/desktop/getting-started/reissuing-http-requests)

### Understand cookies, sessions, and form data

Use the application's supplied demo account and normal login flow. Saving cookies alone does not authenticate you.

1. Inspect the assigned application’s real login request in the browser or Burp. Identify its method, endpoint, form fields, and any CSRF token.
2. Replay that application-specific login request with curl and -c results/cookies.txt so the resulting session cookies are saved. A login in your browser does not fill curl’s separate cookie jar. Alternatively, use the authenticated request copied from your browser or Burp, preserving its cookies and tokens.
3. Then request the profile with the same session, as shown below. Confirm the response is an authenticated page rather than a login form.

**Kali Bash · application with a cookie-based demo session**

```bash
curl -sS -c results/cookies.txt -o results/start.html "$BASE_URL/"
curl -sS -b results/cookies.txt -c results/cookies.txt \
  -D results/session.headers -o results/session.html "$BASE_URL/profile"
```

-c writes the cookie jar; -b sends cookies from it. The first GET is only a starting-page request, not a login. Between these two commands, perform the actual application-specific login request with -c results/cookies.txt. This /profile example needs an assigned app implementing that route; the static local practice server has neither accounts nor sessions.

**What to look for:** Compare the authenticated and unauthenticated responses. Check cookie host/path/expiry, the request method, and anti-CSRF requirements before interpreting differences.

**Common traps**

- An HTML login form returned with 200 is not an authenticated profile.
- Do not publish live challenge cookies or session tokens in your notes.
- Do not confuse a token's visible encoding with whether it is trusted or signed.

**References:** [curl HTTP scripting](https://curl.se/docs/httpscripting.html) · [curl cookie options](https://curl.se/docs/manpage.html)

### Test a vulnerability hypothesis in the assigned toy app

Start with a working request and change one thing. These checks describe deliberately vulnerable exercises, not the static practice server.

1. Access control / IDOR: use two supplied demo accounts and two known objects. As account A, compare access to A's object with B's private toy object. Inspect ownership and content, not just status.
2. Path traversal: if the prompt gives a file-reading exercise, compare welcome.txt with a harmless supplied fixture such as ../ctf-note.txt. Confirm that content came from outside the intended directory.
3. SQL injection: in a supplied vulnerable search form, compare a normal value with a single quote. A database-specific error is a lead; seek a bounded confirmation in the intended exercise.
4. Record the cause and a defensive fix: server-side authorization, path allowlists/canonicalization, or parameterized database queries.

**Kali Bash · supplied vulnerable search exercise only**

```bash
curl -sS -G --data-urlencode 'q=hello' "$BASE_URL/search"
curl -sS -G --data-urlencode "q='" "$BASE_URL/search"
```

-G puts URL-encoded data into a GET query. A generic 500 error is not proof of SQL injection. This example stops at hypothesis testing and does not extract a database.

**What to look for:** Use observed, suspected, and confirmed accurately. A reproducible baseline plus one controlled change is more useful than a screenshot of an unexplained error.

**Common traps**

- A changed identifier with HTTP 200 does not prove IDOR if the response is public or belongs to the same account.
- Silence or lack of errors does not establish safety.
- Apply each test only when the prompt, scope, and application make it relevant.

**References:** [OWASP IDOR testing](https://wstg.owasp.org/v4.1/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References/) · [OWASP traversal testing](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/05-Authorization_Testing/01-Testing_Directory_Traversal_File_Include/) · [OWASP SQL injection testing](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection/)

## 06 / Network security

Analyze supplied packet captures offline to understand protocols, conversations, transferred objects, and timing. DNS records and service discovery can help when the challenge assigns a domain or target; active commands require the permitted scope.

### Select the challenge workspace

```bash
mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}
cd ~/hack4gov-review/challenge-01
pwd
ls -lah work/
```

Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence.

### Get the capture's shape before filtering

Replace capture.pcapng with the provided PCAP/PCAPNG file. Work on a copy and start with duration, protocol mix, and endpoint pairs.

**Kali Bash · offline capture**

```bash
capinfos work/capture.pcapng
tshark -n -r work/capture.pcapng -q -z io,phs
tshark -n -r work/capture.pcapng -q -z conv,tcp
tshark -n -r work/capture.pcapng -q -z endpoints,ip
```

capinfos reports file/capture metadata. -r reads a file; -n disables name resolution; -q reduces packet-line output. The statistics identify protocol mix, conversations, and endpoints.

**What to look for:** Pick a concrete lead: a notable protocol, large transfer, repeated connection, or time window. In Wireshark, use Statistics → Protocol Hierarchy, Conversations, and Endpoints.

**Common traps**

- Traffic volume or an unfamiliar host is not proof of a threat.
- A capture may start late or omit packets.
- A display filter does not automatically constrain every statistics option.

**References:** [Capinfos manual](https://www.wireshark.org/docs/man-pages/capinfos.html) · [TShark manual](https://www.wireshark.org/docs/man-pages/tshark.html)

### Use display filters, not capture-filter syntax

Paste these expressions into Wireshark's display-filter bar, or use them after TShark -Y. They operate on a saved capture.

**Wireshark display-filter bar · one expression at a time**

```bash
dns
dns.flags.response == 0
dns.flags.rcode != 0
http.request
http.request.method == "POST"
http.response.code >= 400
tcp.stream == 4
tcp.flags.syn == 1 && tcp.flags.ack == 0
tcp.analysis.retransmission
ip.addr == 192.0.2.10
```

dns.flags.response == 0 selects queries; rcode != 0 highlights DNS error codes. tcp.stream chooses a conversation. The IP is a documentation example to replace with an endpoint already seen in the file.

**What to look for:** Ask which packets satisfy your hypothesis. A stream index starts at zero and must be discovered in your capture. No result may mean the chosen stream or decoded protocol is absent.

**Common traps**

- tcp port 80 is capture-filter syntax; tcp.port == 80 is a display filter.
- Quotes and case matter in expressions.
- HTTPS traffic may show TLS without readable HTTP fields.

**References:** [Display-filter syntax](https://www.wireshark.org/docs/man-pages/wireshark-filter.html) · [DNS fields](https://www.wireshark.org/docs/dfref/d/dns.html) · [HTTP fields](https://www.wireshark.org/docs/dfref/h/http.html) · [TCP fields](https://www.wireshark.org/docs/dfref/t/tcp.html)

### Extract a small DNS and HTTP evidence table

Export fields you can compare instead of reading every packet. Keep the frame number so you can return to the original evidence.

**Kali Bash · DNS table**

```bash
tshark -n -r work/capture.pcapng -Y 'dns' -T fields \
  -E header=y -E separator=, -E quote=d \
  -e frame.number -e ip.src -e dns.flags.response \
  -e dns.qry.name -e dns.a > results/dns.csv
```

This records frame, sender, query/response state, requested name, and IPv4 answers. Some rows legitimately have no answer field.

**Kali Bash · HTTP requests**

```bash
tshark -n -r work/capture.pcapng -Y 'http.request' -T fields \
  -E header=y -E separator=, -E quote=d \
  -e frame.number -e tcp.stream -e http.request.method \
  -e http.host -e http.request.uri > results/http.csv
```

-T fields and -e choose columns. Compare host, method, path, and stream. Empty output can reflect encryption or missing HTTP dissection, not an absence of all web traffic.

**What to look for:** Connect a DNS name to an endpoint, then to a relevant request and stream. Keep that chain in your solution notes.

**Common traps**

- An IPv6 answer is in dns.aaaa rather than dns.a.
- Encrypted DNS may not appear as plain dns fields.
- A name in a packet is a clue, not an attribution conclusion.

**References:** [Kali TShark options](https://www.kali.org/tools/wireshark/) · [DNS field reference](https://www.wireshark.org/docs/dfref/d/dns.html) · [HTTP field reference](https://www.wireshark.org/docs/dfref/h/http.html)

### Follow a conversation and recover transferred objects

Select a promising packet and use Analyze → Follow → TCP Stream in Wireshark. Replace stream 4 with the index you found.

**Kali Bash · offline reconstruction**

```bash
tshark -n -r work/capture.pcapng -q -z 'follow,tcp,ascii,4'
mkdir -p results/http-objects
tshark -n -r work/capture.pcapng -q \
  --export-objects http,results/http-objects/
find results/http-objects -type f -exec file {} \;
```

The first command shows a readable conversation. The export command reconstructs available HTTP objects. Identify recovered files before opening them, and preserve their hashes.

**What to look for:** Inspect request/response order, filenames, bodies, and encoded content. Use a raw save or export for byte-exact binary analysis rather than copying an ASCII view.

**Common traps**

- Following TCP does not decrypt HTTPS. Suitable TLS secrets and a compatible capture are needed for decryption.
- Reassembly may be incomplete if packets are missing.
- Treat recovered binaries as artifacts for static analysis, not programs to launch on your host.

**References:** [Follow-stream guide](https://www.wireshark.org/docs/wsug_html_chunked/ChAdvFollowStreamSection.html) · [HTTP object export](https://www.wireshark.org/docs/wsug_html_chunked/ChIOExportSection.html) · [TShark export/follow options](https://www.wireshark.org/docs/man-pages/tshark.html)

### Build an incident timeline

Use timestamps, endpoint pairs, and frame numbers to explain a sequence: initial connection, request, transfer, and later activity.

**Kali Bash · packet timeline**

```bash
tshark -n -r work/capture.pcapng -T fields \
  -E header=y -E separator=, -E quote=d \
  -e frame.number -e frame.time_epoch -e ip.src -e ip.dst \
  -e tcp.stream -e _ws.col.Protocol -e _ws.col.Info \
  > results/timeline.csv
```

Epoch timestamps help compare captures and logs without relying on a displayed local time zone. Add the relevant stream and frame references to your written timeline.

**What to look for:** Separate the observed sequence from your interpretation. Tie a claim about a transferred file back to its frame, stream, recovered content, and hash.

**Common traps**

- Clock skew, missing time-zone information, NAT, and shared endpoints can complicate correlation.
- Do not claim an incident solely because a traffic pattern looks unusual.

**References:** [Wireshark/TShark field output](https://www.kali.org/tools/wireshark/)

### Use scoped service discovery when assigned

This is active testing, unlike PCAP analysis. Practice against the local server from Kali setup; change the target and ports only to match the organizer's permitted scope.

**Kali Bash · local service example**

```bash
TARGET_IP='127.0.0.1'
nmap -sT -sV --version-light -n -p 8000 \
  -oN results/services.txt "$TARGET_IP"
```

-sT uses TCP connections; -sV probes service information; --version-light reduces version probing; -p selects a port; -n skips DNS; -oN saves the result. This example checks one local port and needs no raw-packet scan privileges.

**What to look for:** Read PORT, STATE, SERVICE, and VERSION separately. open indicates a listening service; closed indicates no listener was found; filtered means Nmap could not determine openness because probes/responses were obstructed.

**Common traps**

- A version guess does not establish a vulnerability.
- Do not substitute a government website or all discovered IPs for an assigned target.
- Connection, VPN, firewall, and scan-scope issues can explain missing responses.

**References:** [Nmap options](https://nmap.org/book/man-briefoptions.html) · [TCP connect scanning](https://nmap.org/book/man-port-scanning-techniques.html) · [Nmap port states](https://nmap.org/book/man-port-scanning-basics.html)

### Connect domain records and keep an evidence ledger

For a domain assigned in a challenge, DNS and registration records can explain infrastructure relationships. The example domain below is intentionally invalid.

**Kali Bash · replace with a permitted domain**

```bash
DOMAIN='challenge.example.invalid'
dig "$DOMAIN" A +noall +answer
dig "$DOMAIN" MX +noall +answer
dig "$DOMAIN" TXT +noall +answer
whois "$DOMAIN"
```

A records are IPv4 addresses; MX records identify mail routing; TXT records contain text. WHOIS may be redacted or unavailable. A missing answer can reflect record type, resolver behavior, or a nonexistent name; it is not a complete history.

**Kali Bash · local evidence ledger**

```bash
mkdir -p results
printf 'claim\tsource_url\tobservation\ttime_zone\tconfidence\n' \
  > results/osint-evidence.tsv
```

Add one row per claim. Save enough context to reproduce it: the original URL, supporting detail, relevant date/time zone, and your confidence.

**What to look for:** Ask whether records show a real relationship or simply a shared provider/CDN. Separate direct observations from conclusions in your write-up.

**Common traps**

- Reverse DNS and registration names do not prove ownership of a specific challenge service.
- Do not infer broad scanning scope from a discovered hostname.

**References:** [Kali DNS utilities](https://www.kali.org/tools/bind9/) · [Kali WHOIS](https://www.kali.org/tools/whois/)

## 07 / Competition plan

Hack4Gov is a Jeopardy-style CTF. Review the six challenge categories you confirmed: cryptography, reverse engineering, digital forensics, steganography, web security, and network security. Each independent solve submits a flag for points. Use the event platform for its actual points, scoring, team rules, targets, and flag syntax.

### Triage before going deep

Start by surveying the Jeopardy challenge board. Pick tractable independent challenges, keep leads, and return to harder ones with better evidence.

1. Scan the category-based board. Note each prompt, supplied artifacts, points as displayed, hints, and a possible first test.
2. Prioritize challenges where you recognize the artifact or technique. Use displayed points as one signal, not a guaranteed measure of difficulty.
3. Write one hypothesis and the observation that would support or contradict it.
4. Run the smallest useful test, record its output, and decide the next step.
5. Timebox a dead end when no new evidence appears. Record the attempted commands and next lead, switch to another challenge, and coordinate owners according to the event's team rules.

**What to look for:** Your notes should answer: what did I observe, what did I test, what changed, and what should I try next?

**Common traps**

- Tool output is not a conclusion.
- Do not assume points, time limits, team size, or a flag prefix from this reviewer.
- More aggressive scanning is not a substitute for reading the prompt.

### Keep a reusable solution template

Record enough detail for your future self to reproduce the solve. The shared slides emphasize investigation, evidence analysis, and technical reporting.

**Kali Bash · create your local write-up**

```bash
mkdir -p results
cat > results/solution.md <<'NOTES'
# Challenge title
Category:
Official flag format:
Assigned scope:
Artifact names and SHA-256:
## Observations
## Hypothesis
## Commands and relevant output
## Evidence
Frame / stream / URL / file offset:
Time zone:
## Result
Flag verified against the platform:
## Cause and defensive improvement
## Remaining uncertainty
NOTES
```

Edit the file in a text editor. Save relevant excerpts, not just a terminal screenshot. Keep actual session tokens and sensitive event-only material out of public write-ups.

**What to look for:** Include the exact command, why you ran it, and the evidence that changed your conclusion. When the task concerns a vulnerability, add its cause and a practical mitigation.

**Common traps**

- A finding without evidence is hard to reproduce.
- Do not claim the event accepted a flag unless the platform actually did.

### Check the last mile before submitting

Validate the answer against the prompt and organizer's required format. Review flags are examples, not real event answers.

1. Check capitalization, braces, punctuation, whitespace, and whether the prompt asks for a flag or a specific fact.
2. If a transformation produced binary data, inspect its type instead of forcing text decoding.
3. Confirm that your evidence answers this challenge, not merely a related clue.
4. Submit through the designated competition platform and note its actual response.
5. Keep your solve record and follow the event's publication rules afterward.

**What to look for:** A correct-looking string is still a candidate until its context and required format agree. Copy only the answer, not terminal prompts or extra newlines.

**Common traps**

- Do not invent a HackForGov flag prefix. The provided slides do not specify one.
- Only the competition platform can confirm acceptance.

## 08 / Web exploitation

Practice after reviewing 05: Web security. Compare the vulnerable and corrected behavior in these small local labs. Run command blocks in Kali’s Terminal; keep a server’s terminal running while using the second terminal or browser. Expected-output blocks describe results.

### SQL injection: change logic in a toy query

Kali Bash + Python 3 only. This invented in-memory users table demonstrates how input becomes SQL syntax and how parameter binding fixes it. No server or real database is contacted.

**Run the local SQLite comparison**

```bash
python3 - <<'PY'
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (name TEXT, password TEXT)")
db.executemany("INSERT INTO users VALUES (?, ?)",
               [("alice", "demo-only"), ("bob", "another-demo")])

def unsafe_login(name, password):
    query = (f"SELECT COUNT(*) FROM users WHERE name = '{name}' "
             f"AND password = '{password}'")
    return db.execute(query).fetchone()[0] > 0

def safe_login(name, password):
    query = "SELECT COUNT(*) FROM users WHERE name = ? AND password = ?"
    return db.execute(query, (name, password)).fetchone()[0] > 0

payload = "' OR 1=1 -- "
print("unsafe normal wrong:", unsafe_login("alice", "wrong"))
print("unsafe altered predicate:", unsafe_login(payload, "wrong"))
print("safe altered value:", safe_login(payload, "wrong"))
print("safe demo login:", safe_login("alice", "demo-only"))
db.close()
PY
```

The unsafe function inserts supplied text directly into SQL. In the fixed toy input, a quote ends the string, OR 1=1 makes the predicate true, and -- comments out the remaining password check. The safe function binds both values to ? placeholders, so the same characters remain data. Only boolean results from two dummy rows are printed.

**Expected output**

```text
unsafe normal wrong: False
unsafe altered predicate: True
safe altered value: False
safe demo login: True
```

The wrong password fails normally. The unsafe query accepts the altered predicate; the parameterized query rejects that literal name. A normal supplied demo login still succeeds, confirming the corrected function does not merely deny everything.

**What to look for:** Compare the constructed WHERE clause with the parameterized WHERE clause; locate exactly where the supplied quote changes the query's grammar. Record the normal, changed, and corrected outcomes. A generic error alone would not establish SQL injection in an actual assigned lab.

**Common traps**

- This fixture is deliberately specific to SQLite and this query shape. SQL dialects, string contexts, and application behavior differ.
- Do not quote the ? placeholders or replace them with f-string interpolation. Binding values is what keeps code and data separate.
- The invented plaintext demo passwords simplify the example; the fixture is not a password-storage design. No extraction, automated scanning, or external targets are part of this exercise.

**References:** [Python sqlite3: placeholders and in-memory connections](https://docs.python.org/3/library/sqlite3.html) · [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

### Reflected XSS: prove execution with a local marker

Kali Bash + Python 3 and a browser on the same Kali machine. Work in a disposable practice folder. The app binds to 127.0.0.1:8765; its fixed payload only changes a visible page marker. Stop it with Ctrl+C.

**Start the toy app in terminal 1**

```bash
mkdir -p ~/hack4gov-review/web-exploitation/xss
cd ~/hack4gov-review/web-exploitation/xss
cat > xss_lab.py <<'PY'
from html import escape
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlencode, urlsplit

PAYLOAD = "<svg onload=\"document.getElementById('marker').textContent='XSS executed'\"></svg>"

def render(path, value):
    reflected = escape(value) if path == "/safe" else value
    return ("<!doctype html><meta charset='utf-8'><title>Local XSS lab</title>"
            "<h1>Local reflection lab</h1><p id='marker'>Not executed</p>"
            "<div>" + reflected + "</div>").encode("utf-8")

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        request = urlsplit(self.path)
        if request.path not in ("/unsafe", "/safe"):
            self.send_error(404)
            return
        value = parse_qs(request.query).get("q", [""])[0]
        body = render(request.path, value)
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", 8765), Handler)
    for route in ("unsafe", "safe"):
        print(f"http://127.0.0.1:8765/{route}?{urlencode({'q': PAYLOAD})}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
PY
python3 xss_lab.py
```

The server prints two encoded local URLs. Open both in your own browser. The unsafe route inserts q directly into HTML text; the safe route passes q through html.escape. The marker appears before the injected SVG, so the onload handler can find it. The fixed JavaScript makes no external requests and accesses no credentials.

**Expected visible browser comparison**

```text
/unsafe: marker changes to XSS executed
/safe: marker stays Not executed; markup appears as text
```

The unsafe page treats supplied markup as an SVG element and executes its event handler. The safe page displays the same value as text. Read page source to compare raw <svg with escaped &lt;svg. A reflected string in an HTTP response is not yet proof of JavaScript execution; the visible browser marker supplies that evidence in this toy app.

**What to look for:** Identify the input q, the HTML text reflection point, and the visible side effect. Explain the complete input-to-execution path. Revisit the safe URL and verify that the marker remains unchanged while the supplied text is still displayed.

**Common traps**

- Use the browser on the machine running this server. A different machine's localhost points to itself.
- curl prints response bytes; it does not run browser JavaScript. A reflected payload or status 200 alone does not confirm XSS.
- html.escape is appropriate for this HTML text context. JavaScript, CSS, URL, and other contexts require the corresponding defenses.
- If port 8765 is occupied, choose another unused loopback port and update both the server address and the printed URL port together.

**References:** [PortSwigger: reflected XSS and browser confirmation](https://portswigger.net/web-security/cross-site-scripting/reflected) · [OWASP Cross Site Scripting Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) · [Python html.escape](https://docs.python.org/3/library/html.html) · [Python HTTPServer and request handlers](https://docs.python.org/3/library/http.server.html)

### Business logic: tamper with a client-supplied price

Kali Bash + Python 3 + curl. This local toy checkout calculates a total without creating an order or taking payment. Work in a disposable practice folder. It binds to 127.0.0.1:8766; stop it with Ctrl+C.

**Start the toy checkout in terminal 1**

```bash
mkdir -p ~/hack4gov-review/web-exploitation/pricing
cd ~/hack4gov-review/web-exploitation/pricing
cat > price_lab.py <<'PY'
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs

CATALOG = {"sticker": 500}

def total(path, fields):
    product = fields["product"][0]
    qty = int(fields["qty"][0])
    if product not in CATALOG or not 1 <= qty <= 10:
        raise ValueError("Invalid product or quantity")
    price = int(fields["price_cents"][0]) if path == "/unsafe" else CATALOG[product]
    if not 1 <= price <= 50000:
        raise ValueError("Invalid price")
    return price * qty

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path not in ("/unsafe", "/safe"):
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 2048:
                raise ValueError("Invalid request size")
            fields = parse_qs(self.rfile.read(length).decode("utf-8"))
            body = json.dumps({"total_cents": total(self.path, fields)}).encode("utf-8")
        except (ValueError, KeyError, IndexError):
            self.send_error(400, "Invalid toy order")
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", 8766), Handler)
    print("Toy checkout: http://127.0.0.1:8766 (Ctrl+C to stop)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
PY
python3 price_lab.py
```

Both routes validate the toy product and quantity. The unsafe route accepts price_cents from the request. The safe route obtains the price from its own catalog, where each sticker costs 500 cents. This isolates a business-rule failure even when the incoming value is a valid positive integer.

**Compare three POST requests in terminal 2**

```bash
curl -sS -w '
' -d 'product=sticker&qty=2&price_cents=500' http://127.0.0.1:8766/unsafe
curl -sS -w '
' -d 'product=sticker&qty=2&price_cents=1' http://127.0.0.1:8766/unsafe
curl -sS -w '
' -d 'product=sticker&qty=2&price_cents=1' http://127.0.0.1:8766/safe
```

curl -d submits URL-encoded form data using POST. The second request changes only the submitted price from 500 cents to 1 cent. The third submits that same tampered value to the corrected route. There are no real orders, funds, or accounts in this fixture.

**Expected response bodies, in request order**

```text
{"total_cents": 1000}
{"total_cents": 2}
{"total_cents": 1000}
```

The unsafe route reduces the total based on the client's price. The safe route computes 2 × 500 from server-owned values despite the tampered form field. Hidden fields, disabled inputs, and browser-side validation cannot establish an authoritative product price.

**What to look for:** Hold product and quantity constant, change one input, and compare the returned total with the catalog's intended rule. Distinguish syntactic validation from business validation: 1 is a valid integer but is not the catalog price for this product.

**Common traps**

- An altered field is not a vulnerability unless the server accepts it in a way that violates the intended rule.
- The safe route illustrates authoritative pricing; a production checkout also needs its own authorization, stock, currency, and transaction handling.
- Use only this localhost fixture or an explicitly assigned toy application. Do not transfer the exercise to a real storefront.
- If port 8766 is occupied, change the server bind port and all three curl URLs to the same unused loopback port.

**References:** [PortSwigger: excessive trust in client-side controls](https://portswigger.net/web-security/logic-flaws/examples) · [curl: scripting HTTP form requests](https://curl.se/docs/httpscripting.html) · [Python HTTPServer and request handlers](https://docs.python.org/3/library/http.server.html)

## 09 / Linux basics

Open Kali’s Terminal and type bash to use Bash for these drills. Each note creates its own practice files under ~/hack4gov-review/linux-basics. Start with paths, then learn to read, search, combine commands, and check help. Run one block at a time and read its explanation.

### Know where you are: pwd, cd, and ls

Run this drill in Kali’s Terminal. It creates its own practice folder under ~/hack4gov-review/linux-basics; no earlier drill is required.

**Kali Bash · local path practice**

```bash
mkdir -p "$HOME/hack4gov-review/linux-basics/paths"
cd "$HOME/hack4gov-review/linux-basics/paths" || exit

mkdir -p "./clue folder"
printf '%s\n' 'first clue' > "./clue folder/note.txt"
touch "./.hidden-demo"

pwd
ls
ls -la
cd "./clue folder" || exit
pwd
cat "./note.txt"
cd ".."
```

pwd prints your current directory: first a path ending in /linux-basics/paths, then /paths/clue folder. ls lists its contents; -a includes .hidden-demo and -l shows details such as permissions, owner, size, and modification time. cat prints first clue. The quotes keep clue folder together as one path.

**What to look for:** An absolute path starts at /; a relative path starts from your current directory. . means here, .. means the parent, and ~ means your home directory. "$HOME/..." safely builds a home-based path. Directory names and filenames normally distinguish uppercase from lowercase on Kali.

**Common traps**

- Run one block at a time and stop if setup reports an error. The cd ... || exit guard stops the shell if it cannot enter the practice folder.
- Do not put ~ inside quotes and expect home expansion; use "$HOME/..." when quoting a home-based path.
- ls formatting and full pwd paths vary with the terminal and username. Hidden means the name begins with a dot; it does not mean encrypted.

**References:** [Bash cd and pwd](https://www.gnu.org/software/bash/manual/html_node/Bourne-Shell-Builtins.html) · [Bash tilde expansion](https://www.gnu.org/software/bash/manual/html_node/Tilde-Expansion.html) · [GNU ls](https://www.gnu.org/software/coreutils/manual/html_node/ls-invocation.html) · [GNU filename quoting](https://www.gnu.org/software/coreutils/quotes.html)

### Create, copy, rename, and remove a practice file

Run in Kali’s Terminal. This drill creates its own files inside the files subfolder; every removal names one practice copy.

**Kali Bash · local file practice**

```bash
mkdir -p "$HOME/hack4gov-review/linux-basics/files"
cd "$HOME/hack4gov-review/linux-basics/files" || exit
mkdir -p "./copies"

printf '%s\n' 'original practice' > "./original.txt"
touch "./empty.txt"
cp -i "./original.txt" "./copies/copy.txt"
mv -i "./copies/copy.txt" "./copies/renamed.txt"

ls "./copies"
cat "./copies/renamed.txt"
wc -c "./empty.txt"

rm -i "./copies/renamed.txt"
ls "./copies"
cat "./original.txt"
```

mkdir -p creates missing directories. touch creates empty.txt if absent. cp makes a copy; mv changes the copy’s name. On the first run, ls shows renamed.txt, cat prints original practice, and wc -c reports 0 bytes for empty.txt. rm -i asks before removing the named copy: enter y and press Enter to remove it. The original still prints original practice.

**What to look for:** The -i option asks before cp or mv overwrites an existing destination; rm -i asks before removal. A repeat run may therefore ask extra questions. Review each displayed path before answering.

**Common traps**

- touch does not empty an existing file: it updates timestamps. The 0-byte example assumes you have not added data to this drill’s empty.txt.
- > replaces original.txt with the shown practice text. Keep these examples in their named sandbox.
- rm normally removes without a recycle bin. Avoid wildcard deletion and recursive removal while learning.

**References:** [GNU mkdir](https://www.gnu.org/software/coreutils/manual/html_node/mkdir-invocation.html) · [GNU touch](https://www.gnu.org/software/coreutils/manual/html_node/touch-invocation.html) · [GNU cp](https://www.gnu.org/software/coreutils/manual/html_node/cp-invocation.html) · [GNU mv](https://www.gnu.org/software/coreutils/manual/html_node/mv-invocation.html) · [GNU rm](https://www.gnu.org/software/coreutils/manual/html_node/rm-invocation.html)

### Read text with cat, less, head, and tail

Run in Kali’s Terminal. Create the four-line fixture below before reading it. less is an optional pager; the other examples work without it.

**Kali Bash · create and read local text**

```bash
mkdir -p "$HOME/hack4gov-review/linux-basics/reading"
cd "$HOME/hack4gov-review/linux-basics/reading" || exit
printf '%s\n' 'alpha' 'beta' 'gamma' 'delta' > "./notes.txt"

cat "./notes.txt"
cat -n "./notes.txt"
head -n 2 "./notes.txt"
tail -n 2 "./notes.txt"
```

cat prints all four lines. cat -n adds line numbers 1–4. head -n 2 prints alpha and beta; tail -n 2 prints gamma and delta. These commands read the file without editing it.

**Kali Bash · optional pager**

```bash
command -v less
less "./notes.txt"
```

If command -v less reports that the command exists, open the file with less. Type /gamma and press Enter to search; press q to quit. If less is unavailable, use cat, head, or tail for this drill.

**What to look for:** Use cat for a short text file and less for a long one. head and tail help you inspect a small portion before printing a large file. This drill’s output is predictable because it creates its own fixture.

**Common traps**

- Run the creation block first; the pager block uses its notes.txt.
- less is a viewer, so typing text does not edit the file. q returns to the shell.
- A binary artifact can contain terminal control bytes. Use file or a hex viewer for unknown challenge files before printing them as text.

**References:** [GNU cat](https://www.gnu.org/software/coreutils/manual/html_node/cat-invocation.html) · [GNU head](https://www.gnu.org/software/coreutils/manual/html_node/head-invocation.html) · [GNU tail](https://www.gnu.org/software/coreutils/manual/html_node/tail-invocation.html) · [less upstream FAQ](https://www.greenwoodsoftware.com/less/faq.html)

### Print text, search lines, and find filenames

Run in Kali’s Terminal. This drill creates a tiny log and two local files; grep searches contents while find searches names.

**Kali Bash · echo, printf, and grep**

```bash
mkdir -p "$HOME/hack4gov-review/linux-basics/searching"
cd "$HOME/hack4gov-review/linux-basics/searching" || exit

echo 'Practice search'
printf '%s\n' 'INFO start' 'ERROR login' 'error timeout' 'INFO done' > "./events.log"

grep -n 'ERROR' "./events.log"
grep -ni 'error' "./events.log"
grep -nE '^(ERROR|error)' "./events.log"
grep -nF 'INFO start' "./events.log"

grep -n 'MISSING' "./events.log"
printf 'grep status: %s\n' "$?"
```

echo prints Practice search. printf '%s\n' writes one line per argument. The grep results are 2:ERROR login; then lines 2 and 3; then lines 2 and 3 again; then 1:INFO start. -n shows line numbers, -i ignores case, -E enables extended regex, and -F treats the pattern literally. The final grep prints nothing and the next command prints grep status: 1.

**Kali Bash · find local log filenames**

```bash
mkdir -p "./logs"
cp -i "./events.log" "./logs/session.log"
printf '%s\n' 'local clue' > "./clue.txt"

find "." -type f -name '*.log'
```

Run the preceding block first. find starts at the current directory, limits results to regular files with -type f, and matches the quoted filename pattern. It reports ./events.log and ./logs/session.log; their order can vary. It does not search their contents.

**What to look for:** In the regex, ^ means the beginning of a line and | means either alternative. grep is case-sensitive unless you add -i. Its usual statuses are 0 for a match, 1 for no match, and 2 for an error; inspect $? immediately after grep.

**Common traps**

- Quote regexes and find patterns so the shell does not expand characters such as * or interpret | before the command receives them.
- Use printf for controlled formatting. echo options and backslash handling can differ between shells.
- With printf, keep the format string fixed, such as '%s\n', and pass text as an argument.
- grep status 1 means no match; it does not mean the file could not be read.

**References:** [Bash printf and command builtins](https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html) · [GNU echo](https://www.gnu.org/software/coreutils/manual/html_node/echo-invocation.html) · [GNU grep](https://www.gnu.org/software/grep/manual/grep.html) · [GNU grep exit status](https://www.gnu.org/software/grep/manual/html_node/Exit-Status.html) · [GNU find filename patterns](https://www.gnu.org/software/findutils/manual/html_node/find_html/Base-Name-Patterns.html)

### Connect commands and save their results

Run in Kali’s Terminal. This drill creates its own word list and colon-separated table. Watch the difference between replacing and appending.

**Kali Bash · pipes and redirects**

```bash
mkdir -p "$HOME/hack4gov-review/linux-basics/pipelines"
cd "$HOME/hack4gov-review/linux-basics/pipelines" || exit

printf '%s\n' 'banana' 'apple' 'banana' 'pear' > "./words.txt"
printf '%s\n' 'apple' >> "./words.txt"
cat "./words.txt"

LC_ALL=C sort "./words.txt" | uniq -c > "./counts.txt"
cat "./counts.txt"
wc -l < "./words.txt"

printf '%s\n' 'name:score' 'ana:10' 'ben:20' > "./scores.txt"
cut -d ':' -f 1 "./scores.txt"
```

words.txt contains five lines: banana, apple, banana, pear, apple. > creates or replaces a file; >> appends. The pipe | sends sort’s output into uniq -c, producing counts of 2 apple, 2 banana, and 1 pear, with leading padding. LC_ALL=C gives sort a predictable character order. wc -l prints 5; cut prints name, ana, and ben.

**What to look for:** < feeds a file into a command as standard input. Here wc receives only the contents, so it prints the count without a filename. sort groups equal lines together; uniq counts adjacent duplicates. cut -d ':' -f 1 selects the first colon-delimited field.

**Common traps**

- Save processed output to a different filename. A command such as sort file > file can truncate the input before it is read.
- uniq detects adjacent repeated lines; unsorted duplicates elsewhere can survive.
- wc -l counts newline characters. A final partial line without a newline is not counted.
- cut handles simple delimiters; it does not implement quoted CSV parsing.

**References:** [Bash pipelines](https://www.gnu.org/software/bash/manual/html_node/Pipelines.html) · [Bash redirects](https://www.gnu.org/software/bash/manual/html_node/Redirections.html) · [GNU sort](https://www.gnu.org/software/coreutils/manual/html_node/sort-invocation.html) · [GNU uniq](https://www.gnu.org/software/coreutils/manual/html_node/uniq-invocation.html) · [GNU wc](https://www.gnu.org/software/coreutils/manual/html_node/wc-invocation.html) · [GNU cut](https://www.gnu.org/software/coreutils/manual/html_node/cut-invocation.html)

### Check help and understand executable permission

Run in Kali’s Terminal with Bash. Kali may open another shell by default; type bash first if needed. This drill creates and runs only the short script shown below.

**Kali Bash · local permission practice**

```bash
mkdir -p "$HOME/hack4gov-review/linux-basics/help-permissions"
cd "$HOME/hack4gov-review/linux-basics/help-permissions" || exit

printf '%s\n' '#!/usr/bin/env bash' 'printf "%s\n" "local practice only"' > "./demo.sh"
chmod u=rw,go= "./demo.sh"
ls -l "./demo.sh"
chmod u+x "./demo.sh"
ls -l "./demo.sh"
./demo.sh
chmod u-x "./demo.sh"
```

u means owner, g group, and o others; r means read, w write, and x execute. The first listing starts with -rw-------; adding owner execute changes this to -rwx------. The script prints local practice only. The last command removes owner execute again. Listing metadata such as owner and date varies.

**Kali Bash · discover commands and help**

```bash
command -v grep
help cd
grep --help

# Optional: run if man and the manual page are installed.
command -v man
man grep
```

command -v shows what the shell resolves a command to, which can be a path, builtin, function, or alias. help cd explains Bash’s builtin. grep --help summarizes GNU grep options. man grep opens its installed manual when available; press q to quit. If man is missing, use --help and the official links below.

**What to look for:** ./demo.sh explicitly names a script in the current directory. Read a supplied script before deciding whether to run it in your isolated CTF VM; adding execute permission alone does not establish what its code does.

**Common traps**

- help cd is a Bash builtin and may be unavailable in another shell.
- A missing command or manual page is a prerequisite issue; do not assume every Kali image includes the same extras.
- Use narrow permission changes on your own practice files. Avoid broad chmod 777 changes.
- A filesystem mounted with noexec may prevent direct script execution even when x is set.

**References:** [Bash builtins and command lookup](https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html) · [GNU chmod](https://www.gnu.org/software/coreutils/manual/html_node/chmod-invocation.html) · [GNU symbolic modes](https://www.gnu.org/software/coreutils/manual/html_node/Symbolic-Modes.html) · [man-db documentation system](https://man-db.nongnu.org/)
