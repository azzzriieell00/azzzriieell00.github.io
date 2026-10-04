// Hack4Gov Jeopardy-style CTF study content. Commands are displayed for review, never executed by the website.
window.REVIEW_CHAPTERS = [
  {
    "id": "setup",
    "label": "Kali setup",
    "kind": "START HERE",
    "title": "Prepare your workspace.",
    "intro": "Use Kali’s Terminal for blocks labeled Kali Bash. Run blocks labeled GDB prompt inside the debugger after it launches. Start with this chapter; later examples use supplied artifacts or clearly labeled local practice files. If Linux commands are new to you, start with 09: Linux basics.",
    "notes": [
      {
        "id": "setup-tools",
        "title": "Install and verify a focused toolset",
        "lead": "Do this during preparation, then test the tools and take a VM snapshot. Installed tools vary across Kali images.",
        "blocks": [
          {
            "label": "Kali Bash · preparation",
            "code": "sudo apt update\nsudo apt install file binutils coreutils curl python3 jq\nsudo apt install nmap ffuf burpsuite wireshark tshark\nsudo apt install libimage-exiftool-perl binwalk 7zip steghide\nsudo apt install bind9-dnsutils whois\n\ncommand -v file strings sha256sum curl python3\ncommand -v nmap ffuf burpsuite tshark capinfos\ncommand -v exiftool binwalk 7z steghide dig whois",
            "explanation": "apt update refreshes package indexes. apt install adds the named packages and may ask questions. command -v prints executable paths. Test missing tools individually rather than assuming every Kali installation includes them."
          }
        ],
        "look": "Check local help before a challenge: nmap --help, ffuf -h, tshark -h, binwalk --help, and 7z -h. Tool versions can change options.",
        "pitfalls": [
          "Do not start a rolling-release upgrade during the competition. Prepare and test beforehand.",
          "If APT asks about capture permissions, follow your lab setup; reading supplied PCAP files does not require live capture privileges.",
          "Avoid sudo pip install and --break-system-packages. Use packaged tools or an isolated environment."
        ],
        "sources": [
          [
            "Kali update guidance",
            "https://www.kali.org/docs/general-use/updating-kali/"
          ],
          [
            "Kali tool packages",
            "https://www.kali.org/tools/kali-meta/"
          ],
          [
            "Kali Python isolation",
            "https://www.kali.org/docs/general-use/python3-external-packages/"
          ]
        ]
      },
      {
        "id": "setup-evidence",
        "title": "Preserve evidence before analysis",
        "lead": "Use one folder per challenge. Put original downloads in original/ and do your analysis in work/.",
        "blocks": [
          {
            "label": "Kali Bash · example artifact",
            "code": "mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}\ncd ~/hack4gov-review/challenge-01\npwd\nls -lah original/\n\n# First put the supplied artifact into original/.\n# Replace artifact.bin with the actual filename.\nsha256sum original/artifact.bin > results/original.sha256\ncp -p original/artifact.bin work/\nsha256sum work/artifact.bin\nfile work/artifact.bin",
            "explanation": "Matching digests confirm your starting copy has the same bytes. cp -p preserves available file attributes. Relative paths are resolved from the directory shown by pwd; quote a filename if it contains spaces."
          }
        ],
        "look": "Record the prompt, scope, required flag format, filenames, and first observation. A digest tracks content changes; it does not prove that metadata or a claimed origin is genuine.",
        "pitfalls": [
          "Commands referring to artifact.bin or capture.pcapng need your actual challenge filename.",
          "Do not edit the only original copy. Hash recovered objects too."
        ],
        "sources": [
          [
            "GNU SHA-2 utilities",
            "https://www.gnu.org/software/coreutils/manual/html_node/sha2-utilities.html"
          ],
          [
            "File identification",
            "https://github.com/file/file/blob/master/doc/file.man"
          ]
        ]
      },
      {
        "id": "setup-local",
        "title": "Run a tiny local web practice lab",
        "lead": "This self-contained exercise creates a static clue trail on your own Kali VM. Its REVIEW{...} answer is invented for practice and is not the competition's flag format.",
        "blocks": [
          {
            "label": "Kali Bash · terminal 1",
            "code": "mkdir -p ~/hack4gov-review/local-web/public\ncd ~/hack4gov-review/local-web/public\n\ncat > index.html <<'HTML'\n<!doctype html>\n<title>Local CTF practice</title>\n<h1>Review lab</h1>\n<!-- Practice clue: follow robots.txt -->\nHTML\n\nprintf 'User-agent: *\\nDisallow: /practice-note.txt\\n' > robots.txt\nprintf 'REVIEW{read_the_response}\\n' > practice-note.txt\npython3 -m http.server 8000 --bind 127.0.0.1",
            "explanation": "Keep this terminal running. Binding to 127.0.0.1 keeps the exercise on the local machine. Press Ctrl+C in this terminal when finished. This simple server is for practice, not a production deployment."
          },
          {
            "label": "Kali Bash · terminal 2",
            "code": "BASE_URL='http://127.0.0.1:8000'\ncurl -sS \"$BASE_URL/\"\ncurl -sS \"$BASE_URL/robots.txt\"\ncurl -sS \"$BASE_URL/practice-note.txt\"",
            "explanation": "Follow the page comment to robots.txt, then inspect the named practice file. You can also visit the URL in Kali's browser. Later /login, /profile, and /search examples require a separate assigned application; this static lab does not implement them."
          }
        ],
        "look": "The final response is a practice answer. Explain which clue led to it rather than treating a tool's output as the whole solution.",
        "answer": "The HTML comment points to robots.txt. Its practice path points to practice-note.txt, whose body contains REVIEW{read_the_response}. In a real challenge, confirm that path is inside the assigned scope and use the organizer's exact flag format.",
        "pitfalls": [
          "If port 8000 is busy, pick a free port and update BASE_URL in both your commands and browser.",
          "A robots.txt path is a clue, not permission to access an unrelated system."
        ],
        "sources": [
          [
            "Python local HTTP server",
            "https://docs.python.org/3/library/http.server.html"
          ],
          [
            "Robots protocol",
            "https://datatracker.ietf.org/doc/html/rfc9309"
          ]
        ]
      },
      {
        "id": "setup-python",
        "title": "Use an isolated Python workspace",
        "lead": "Most examples here use Python's standard library and need no extra packages. Use a virtual environment when a specific practice tool needs dependencies.",
        "blocks": [
          {
            "label": "Kali Bash · optional Python environment",
            "code": "sudo apt install python3-venv\nmkdir -p ~/hack4gov-review/python-lab\ncd ~/hack4gov-review/python-lab\npython3 -m venv .venv\nsource .venv/bin/activate\npython --version\npython -m pip --version\n# Follow the selected tool's official dependency instructions here.\ndeactivate",
            "explanation": "Activation selects the environment's Python. Use python -m pip inside it when official tool instructions require a package. deactivate returns to the normal shell environment."
          }
        ],
        "look": "If you see externally-managed-environment, check whether you are using Kali's system Python. For standalone packaged tools, prefer APT; Kali also documents pipx.",
        "pitfalls": [
          "A missing module and an unsupported Python version are different problems. Read the actual error.",
          "Keep a working installation and needed symbols available before an offline event."
        ],
        "sources": [
          [
            "Kali Python packages",
            "https://www.kali.org/docs/general-use/python3-external-packages/"
          ]
        ]
      }
    ]
  },
  {
    "id": "crypto",
    "label": "Cryptography",
    "kind": "CHALLENGE CATEGORY 01",
    "title": "Understand the transformation.",
    "intro": "Identify the representation, cipher, key material, or mathematical relationship before choosing a tool. Compare your recovered answer with the exact challenge format. Start with the small local exercises, then apply the method to supplied data.",
    "workspace": {
      "label": "Kali Bash · select this challenge workspace",
      "code": "mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}\ncd ~/hack4gov-review/challenge-01\npwd\nls -lah work/",
      "explanation": "Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence."
    },
    "notes": [
      {
        "id": "misc-encoding",
        "title": "Distinguish encoding, encryption, and hashing",
        "lead": "Encoding changes representation; encryption uses a key; a hash is a digest rather than reversible text. Treat appearance as a hypothesis, then test one transformation.",
        "blocks": [
          {
            "label": "Kali Bash · offline Python examples",
            "code": "python3 - <<'PY'\nimport base64, codecs, hashlib\nfrom urllib.parse import unquote\n\nprint(base64.b64decode(\"SGVsbG8=\", validate=True).decode(\"ascii\"))\nprint(bytes.fromhex(\"48656c6c6f\").decode(\"ascii\"))\nprint(codecs.decode(\"Uryyb\", \"rot_13\"))\nprint(unquote(\"%48%65%6c%6c%6f\"))\n\nciphertext = bytes.fromhex(\"6b464f4f4c\")\nprint(bytes(b ^ 0x23 for b in ciphertext).decode(\"ascii\"))\nprint(hashlib.sha256(b\"Hello\").hexdigest())\nPY",
            "explanation": "The first five outputs are Hello. The XOR example uses an explicitly supplied toy key, 0x23. The final line is a SHA-256 digest, not another encoding of printable Hello."
          }
        ],
        "look": "Record the original bytes, transformation, parameters/key, output type, and why the result makes sense. Keep binary output as bytes until its format is known.",
        "pitfalls": [
          "Base64 decoding returns bytes. UTF-8/ASCII interpretation is a separate step.",
          "Padding, a URL-safe alphabet, or binary output can explain decode errors.",
          "Do not hide errors with errors='ignore' or keep decoding without a reason.",
          "A hexadecimal string could represent bytes or a hash; length alone is not proof."
        ],
        "sources": [
          [
            "Python Base64",
            "https://docs.python.org/3/library/base64.html"
          ],
          [
            "Python bytes/hex",
            "https://docs.python.org/3/library/stdtypes.html#bytes.fromhex"
          ],
          [
            "Python codecs",
            "https://docs.python.org/3/library/codecs.html"
          ],
          [
            "Python URL quoting",
            "https://docs.python.org/3/library/urllib.parse.html"
          ]
        ]
      },
      {
        "id": "misc-hashes",
        "title": "Check exact bytes when comparing hashes",
        "lead": "Case, whitespace, newline characters, and the text encoding change a digest. There is no general decode-hash command.",
        "blocks": [
          {
            "label": "Kali Bash · compare two inputs",
            "code": "printf 'Hello' | sha256sum\nprintf 'Hello\\n' | sha256sum\npython3 - <<'PY'\nimport hashlib\nprint(hashlib.sha256(b\"Hello\").hexdigest())\nPY",
            "explanation": "The first shell digest and the Python digest match. The second shell digest differs because its input includes a newline. printf makes the distinction explicit."
          }
        ],
        "look": "If a challenge provides a hash and candidate data, compare hashes of exact candidate bytes. Save the algorithm and byte representation used.",
        "pitfalls": [
          "Do not identify an algorithm solely from the digest's length.",
          "Hashing a filename string differs from hashing that file's contents.",
          "Do not publish a real password or credential as practice material."
        ],
        "sources": [
          [
            "Python hashlib",
            "https://docs.python.org/3/library/hashlib.html"
          ],
          [
            "GNU hash utilities",
            "https://www.gnu.org/software/coreutils/manual/html_node/sha2-utilities.html"
          ]
        ]
      },
      {
        "id": "misc-drill",
        "title": "Practice a small decoding chain",
        "lead": "This local drill creates a file with an intentionally encoded practice answer. Use file, strings, and a single Base64 transformation.",
        "blocks": [
          {
            "label": "Kali Bash · invented practice file",
            "code": "mkdir -p ~/hack4gov-review/encoding-drill\ncd ~/hack4gov-review/encoding-drill\nprintf '%s\\n' 'UkVWSUVXe2VuY29kaW5nX2lzX25vdF9lbmNyeXB0aW9ufQ==' > clue.txt\nfile clue.txt\nstrings clue.txt\npython3 - <<'PY'\nfrom pathlib import Path\nimport base64\ntext = Path(\"clue.txt\").read_text().strip()\nprint(base64.b64decode(text, validate=True).decode(\"ascii\"))\nPY",
            "explanation": "The original clue is text. Strip the file's line-ending whitespace before validating the Base64 alphabet. The output is a deliberately invented REVIEW{...} practice answer."
          }
        ],
        "look": "Explain why this transformation fits the input, and preserve the input rather than only saving the final answer.",
        "answer": "The output is REVIEW{encoding_is_not_encryption}. Base64 is reversible representation, so no secret key is needed. This sample prefix belongs only to the local exercise; read the competition platform for its required flag format.",
        "sources": [
          [
            "Python Base64 validation",
            "https://docs.python.org/3/library/base64.html"
          ]
        ]
      },
      {
        "id": "crypto-classical-pattern-triage",
        "title": "Classical cipher triage: frequency and repeated patterns",
        "lead": "Count letters and compare word patterns before guessing the cipher or substituting letters.",
        "blocks": [
          {
            "label": "Kali Bash · invented local cryptography practice",
            "code": "python3 - <<'PY'\nfrom collections import Counter\n\ncipher = 'ZIT LTEKTZ OL QZ ZIT GSR ZGVTK'\nletters = [c for c in cipher.upper() if 'A' <= c <= 'Z']\nwords = cipher.split()\n\ndef pattern(word):\n    seen = {}\n    return '-'.join(str(seen.setdefault(c, len(seen))) for c in word)\n\nprint('letters:', len(letters))\nprint('top five:', Counter(letters).most_common(5))\nprint('repeated words:', [(w, n) for w, n in Counter(words).items() if n > 1])\nprint('word lengths:', [len(w) for w in words])\nprint('LTEKTZ pattern:', pattern('LTEKTZ'))\nPY",
            "explanation": "Counter tallies letters; most_common(5) reports the five largest counts. Equal counts follow first appearance order. The pattern assigns a number when a new letter first appears, so the second and fifth positions in LTEKTZ match. In a simple one-to-one substitution, repeated letters and word shapes survive even though letter names change."
          }
        ],
        "look": "The repeated three-letter word ZIT is a candidate for a common three-letter word, but the ciphertext alone does not establish which one. Try a tentative ZIT -> THE mapping, then check whether it remains consistent everywhere; never silently give one ciphertext symbol two different plaintext meanings. LTEKTZ and SECRET have the same 0-1-2-3-1-4 pattern. A whole-message consistency check is stronger than one plausible word.",
        "pitfalls": [
          "A 24-letter sample is too short for reliable language-frequency conclusions; the most common letter is not automatically E.",
          "Spaces may be artificial. Polyalphabetic, homophonic, transposition, and binary ciphers require different hypotheses.",
          "This script measures clues; it does not automatically solve an arbitrary cipher."
        ],
        "answer": "Expected output: letters: 24 · top five: [('Z', 5), ('T', 5), ('I', 2), ('L', 2), ('K', 2)] · repeated words: [('ZIT', 2)] · word lengths: [3, 6, 2, 2, 3, 3, 5] · LTEKTZ pattern: 0-1-2-3-1-4 This invented example was made with ABCDEFGHIJKLMNOPQRSTUVWXYZ -> QWERTYUIOPASDFGHJKLZXCVBNM. Its plaintext is THE SECRET IS AT THE OLD TOWER.",
        "sources": [
          [
            "Python collections.Counter and most_common",
            "https://docs.python.org/3/library/collections.html#collections.Counter"
          ]
        ]
      },
      {
        "id": "crypto-toy-rsa-modular-inverse",
        "title": "Toy RSA: modular inverse and a round trip",
        "lead": "Use supplied tiny primes to understand n, phi, e, d, and modular exponentiation; recover the invented integer message 42.",
        "blocks": [
          {
            "label": "Kali Bash · invented local cryptography practice",
            "code": "python3 - <<'PY'\nfrom math import gcd\n\np, q, e, m = 47, 59, 17, 42\nn = p * q\nphi = (p - 1) * (q - 1)\nassert gcd(e, phi) == 1\nassert 0 <= m < n\nd = pow(e, -1, phi)\nc = pow(m, e, n)\nrecovered = pow(c, d, n)\nprint('n:', n, 'phi:', phi, 'gcd:', gcd(e, phi))\nprint('d:', d, 'inverse check:', (e * d) % phi)\nprint('ciphertext:', c, 'recovered:', recovered)\nPY",
            "explanation": "For the supplied distinct primes, n = p*q and phi = (p-1)*(q-1). gcd(e, phi) == 1 permits an inverse: d satisfies (e*d) % phi == 1. Python's built-in pow(e, -1, phi) computes that inverse; pow(m, e, n) computes m**e modulo n efficiently. Encryption produces c = 1466, and the matching private exponent recovers m = 42. RFC 8017 expresses the private-key inverse condition modulo lambda(n); using phi here also satisfies it because lambda(n) divides phi."
          }
        ],
        "look": "The inverse check must print 1, and recovered must equal the original message integer. Challenge-provided p and q make this arithmetic possible; n by itself does not directly reveal phi. Treat 42 as an integer fixture. Recovering an integer and decoding a message's specified byte representation are separate steps.",
        "pitfalls": [
          "Use Python 3.8 or later for negative-exponent modular pow. A non-coprime e and phi do not have a modular inverse.",
          "Use the built-in pow, not math.pow: math.pow converts operands to floating point and lacks the modulus argument.",
          "The phi formula used here requires distinct prime p and q; arbitrary or repeated factors change the problem.",
          "These deliberately tiny, unpadded parameters teach arithmetic. They are not a secure encryption implementation or evidence that correctly deployed RSA is easy to break."
        ],
        "answer": "Expected output: n: 2773 phi: 2668 gcd: 1 · d: 157 inverse check: 1 · ciphertext: 1466 recovered: 42",
        "sources": [
          [
            "Python built-in pow",
            "https://docs.python.org/3/library/functions.html#pow"
          ],
          [
            "Python math.gcd and math.pow",
            "https://docs.python.org/3/library/math.html#math.gcd"
          ],
          [
            "RFC 8017: RSA key types and primitives",
            "https://www.rfc-editor.org/rfc/rfc8017.html#section-3"
          ]
        ]
      }
    ]
  },
  {
    "id": "reverse",
    "label": "Reverse engineering",
    "kind": "CHALLENGE CATEGORY 02",
    "title": "Follow the program’s logic.",
    "intro": "Identify the binary format and architecture, inspect strings and references, and reconstruct the input checks. Use an isolated Kali lab for challenge binaries. Practice on the fully shown local examples before debugging supplied programs.",
    "workspace": {
      "label": "Kali Bash · select this challenge workspace",
      "code": "mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}\ncd ~/hack4gov-review/challenge-01\npwd\nls -lah work/",
      "explanation": "Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence."
    },
    "notes": [
      {
        "id": "misc-reverse",
        "title": "Start reversing with static inspection",
        "lead": "Keep unknown binaries in a disposable lab VM. First determine format and architecture, then follow strings and references toward input checks.",
        "blocks": [
          {
            "label": "Kali Bash · supplied ELF only",
            "code": "file work/challenge\nstrings -a -n 5 work/challenge\nreadelf -hW work/challenge\nreadelf -SW work/challenge\nreadelf -sW work/challenge\nreadelf -p .rodata work/challenge\nobjdump -d -M intel work/challenge > results/disassembly.txt",
            "explanation": "readelf applies to ELF files. Inspect the header, sections, and symbols; .rodata must exist for that string-dump command. Intel syntax is appropriate for x86 disassembly, not every architecture."
          },
          {
            "label": "Kali Bash · optional Ghidra preparation",
            "code": "sudo apt install ghidra\ncommand -v ghidra\nghidra",
            "explanation": "Install and launch this optional GUI during preparation. Test the bundled Java/runtime setup before the event. The static ELF inspection commands above do not require Ghidra."
          }
        ],
        "steps": [
          "In Ghidra, create a project and import the supplied binary. Check the detected format/architecture before analysis.",
          "Search for relevant strings and follow their references.",
          "Trace input, transformations, comparison constants, loops, and success/failure branches.",
          "Rename useful variables/functions and compare the Listing with the Decompiler."
        ],
        "look": "Reconstruct a small condition you can explain. Decompiler output is an interpretation, not guaranteed original C source or exact types.",
        "pitfalls": [
          "Stripped symbols and packed code can obscure structure.",
          "Wrong architecture, signedness, or byte order can change your interpretation.",
          "Do not run an unknown binary on your everyday host just to see what it does."
        ],
        "sources": [
          [
            "GNU readelf",
            "https://sourceware.org/binutils/docs/binutils/readelf.html"
          ],
          [
            "GNU objdump",
            "https://sourceware.org/binutils/docs/binutils/objdump.html"
          ],
          [
            "Ghidra beginner guide",
            "https://ghidra.re/ghidra_docs/GhidraClass/Beginner/Introduction_to_Ghidra_Student_Guide.html"
          ],
          [
            "Kali Ghidra package",
            "https://www.kali.org/tools/ghidra/"
          ]
        ]
      },
      {
        "id": "reverse-gdb",
        "title": "Observe a byte transformation with GDB",
        "lead": "A debugger can stop at a function and show memory before and after it runs. Practice with this fully shown local program in your Kali lab VM.",
        "blocks": [
          {
            "label": "Kali Bash · optional preparation before the event",
            "code": "sudo apt install gdb build-essential",
            "explanation": "The gdb package supplies the debugger. build-essential supplies the C build prerequisites for this local drill. Prepare these before an offline event."
          },
          {
            "label": "Kali Bash · create and compile a known toy program",
            "code": "mkdir -p ~/hack4gov-review/gdb-drill\ncd ~/hack4gov-review/gdb-drill\ncat > practice.c <<'C'\n#include <stdio.h>\n\nstatic void reveal(unsigned char *bytes) {\n    for (int i = 0; i < 5; ++i)\n        bytes[i] ^= 0x23;\n}\n\nint main(void) {\n    unsigned char data[6] = {0x6b, 0x46, 0x4f, 0x4f, 0x4c, 0};\n    reveal(data);\n    puts((const char *)data);\n    return 0;\n}\nC\ngcc -g -O0 -Wall -Wextra -o practice practice.c\ngdb -q ./practice",
            "explanation": "This source only transforms five local bytes and prints them. -g emits debugging information; -O0 limits optimization so the source variables are easier to inspect."
          },
          {
            "label": "GDB prompt · inspect the same buffer before and after",
            "code": "break reveal\nrun\nx/5bx bytes\nprint/x bytes[0]\nfinish\nx/s data\ncontinue\nquit",
            "explanation": "At reveal, x/5bx displays five bytes in hex: 6b 46 4f 4f 4c. The first byte is 0x6b. finish runs until reveal returns to main; x/s data then shows Hello. continue lets the program print Hello and exit."
          }
        ],
        "look": "Connect the function's byte operation to the observed change. Record the breakpoint, buffer size, before/after values, and why the result matches the code.",
        "pitfalls": [
          "run, step, next, finish, and continue execute the target. GDB is not a containment boundary; keep supplied unknown programs in an isolated lab.",
          "Missing symbols, optimization, or a different architecture can make source names and variables unavailable. This drill's function name is not a universal breakpoint.",
          "x/s expects a terminated string. Use a fixed byte count such as x/5bx when examining binary data."
        ],
        "sources": [
          [
            "Kali GDB package",
            "https://www.kali.org/tools/gdb/"
          ],
          [
            "Kali build-essential package",
            "https://pkg.kali.org/pkg/build-essential"
          ],
          [
            "Debian build-essential prerequisites",
            "https://packages.debian.org/stable/build-essential"
          ],
          [
            "GCC debug information",
            "https://gcc.gnu.org/onlinedocs/gcc/Debugging-Options.html"
          ],
          [
            "GCC optimization options",
            "https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html"
          ],
          [
            "GDB breakpoints",
            "https://sourceware.org/gdb/current/onlinedocs/gdb.html/Set-Breaks.html"
          ],
          [
            "GDB memory examination",
            "https://sourceware.org/gdb/current/onlinedocs/gdb.html/Memory.html"
          ],
          [
            "GDB stepping and finish",
            "https://sourceware.org/gdb/current/onlinedocs/gdb.html/Continuing-and-Stepping.html"
          ]
        ]
      },
      {
        "id": "reverse-bytecheck",
        "title": "Reconstruct a small byte check and verify the candidate",
        "lead": "After tracing a program's input check, translate the exact operations into a small script. This invented check uses XOR, addition, and unsigned eight-bit wrapping.",
        "blocks": [
          {
            "label": "Kali Bash · offline Python reconstruction",
            "code": "python3 - <<'PY'\ntarget = bytes.fromhex(\"724d565653\")\n\ndef check(candidate):\n    transformed = bytes(((b ^ 0x23) + 7) & 0xff for b in candidate)\n    return transformed == target\n\ncandidate = bytes(((t - 7) & 0xff) ^ 0x23 for t in target)\nprint(candidate.decode(\"ascii\"))\nprint(check(candidate))\nprint(check(b\"HELLO\"))\nPY",
            "explanation": "The output is Hello, True, then False. The observed forward check XORs each byte and then adds 7; reconstruction subtracts 7 first and then XORs. Replaying the forward check verifies the recovered bytes."
          }
        ],
        "look": "Recover the input length, byte width, operation order, constants, and comparison from the program. Match the original check before treating a decoded-looking string as a solution.",
        "pitfalls": [
          "The & 0xff mask models unsigned eight-bit wrapping. Signed arithmetic, larger integer widths, or a cast in another position can change the result.",
          "Not every check is invertible. A hash or a lossy operation needs a different approach.",
          "Hello is only this drill's candidate, not a competition flag. Preserve exact bytes and follow the real program's full acceptance conditions."
        ],
        "sources": [
          [
            "Python bytes and hexadecimal conversion",
            "https://docs.python.org/3/library/stdtypes.html#bytes.fromhex"
          ],
          [
            "Python integer bitwise operations",
            "https://docs.python.org/3/library/stdtypes.html#bitwise-operations-on-integer-types"
          ]
        ]
      }
    ]
  },
  {
    "id": "forensics",
    "label": "Digital forensics",
    "kind": "CHALLENGE CATEGORY 03",
    "title": "Read the evidence.",
    "intro": "Preserve the original artifact and investigate a copy. Identify file types, metadata, archives, logs, and memory evidence. Record file offsets, timestamps, hashes, and uncertainty so another person can reproduce the result.",
    "workspace": {
      "label": "Kali Bash · select this challenge workspace",
      "code": "mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}\ncd ~/hack4gov-review/challenge-01\npwd\nls -lah work/",
      "explanation": "Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence."
    },
    "notes": [
      {
        "id": "misc-triage",
        "title": "Identify the bytes before trusting the extension",
        "lead": "Begin with file signatures and readable strings. A file named image.jpg may contain another format or an embedded object.",
        "blocks": [
          {
            "label": "Kali Bash · supplied artifact copy",
            "code": "file work/artifact.bin\nsha256sum work/artifact.bin\nstrings -a -n 6 -t x work/artifact.bin > results/strings.txt\nstrings -a -e l work/artifact.bin > results/strings-utf16.txt\nexiftool -a -u -g1 work/artifact.bin\nbinwalk work/artifact.bin",
            "explanation": "strings -a scans the full file; -n 6 sets the minimum length; -t x includes hex offsets; -e l searches 16-bit little-endian strings. ExifTool groups metadata; Binwalk highlights possible embedded signatures."
          }
        ],
        "look": "Keep the format, architecture where relevant, offsets, unexpected metadata, and meaningful phrases. Validate signature hits by examining the recovered object's type.",
        "pitfalls": [
          "Printable text can occur by chance and may be unrelated to the answer.",
          "Binwalk v2 and v3 differ; check local --help before copying extraction flags from a tutorial.",
          "Do not overwrite the original when experimenting."
        ],
        "sources": [
          [
            "GNU strings",
            "https://sourceware.org/binutils/docs/binutils/strings.html"
          ],
          [
            "ExifTool options",
            "https://exiftool.org/exiftool_pod2.html"
          ],
          [
            "Kali Binwalk",
            "https://www.kali.org/tools/binwalk/"
          ],
          [
            "Upstream Binwalk",
            "https://github.com/ReFirmLabs/binwalk"
          ]
        ]
      },
      {
        "id": "osint-metadata",
        "title": "Read image metadata as a clue",
        "lead": "Use a supplied image copy. Compare camera metadata, embedded timestamps, GPS tags, and filesystem times without treating any one value as proof.",
        "blocks": [
          {
            "label": "Kali Bash · supplied image",
            "code": "sha256sum work/challenge.jpg > results/image.sha256\nexiftool -a -G1 -s work/challenge.jpg > results/metadata.txt\nless results/metadata.txt",
            "explanation": "-a includes duplicate tags; -G1 identifies tag groups; -s prints tag names. Press q to exit less. The same-looking time in a File group and an EXIF group may have different meaning."
          }
        ],
        "look": "Look for GPS coordinates, creator/software tags, descriptions, and time-zone information. If tags are absent, return to visual clues rather than assuming there is no answer.",
        "pitfalls": [
          "Metadata can be removed, altered, or inherited during editing.",
          "Do not infer a time zone when the timestamp does not include one.",
          "A hash establishes which image you analyzed, not whether its metadata is truthful."
        ],
        "sources": [
          [
            "ExifTool FAQ",
            "https://exiftool.org/faq.html"
          ],
          [
            "ExifTool options",
            "https://exiftool.org/exiftool_pod2.html"
          ]
        ]
      },
      {
        "id": "misc-archives",
        "title": "List, test, and extract an archive",
        "lead": "Inspect the archive before extraction. Use a fresh working directory in your VM and re-run file triage on the recovered files.",
        "blocks": [
          {
            "label": "Kali Bash · supplied archive",
            "code": "7z l work/bundle.zip\n7z t work/bundle.zip\n7z x work/bundle.zip -owork/extracted\nfind work/extracted -type f -exec file {} \\;",
            "explanation": "l lists entries; t tests integrity; x extracts with directory structure. The -o switch takes its output folder directly. Let the tool prompt if the challenge provides an archive password."
          }
        ],
        "look": "Look for misleading names, nested archives, small text files, and unexpected formats. Integrity success confirms extraction mechanics, not that every file is harmless.",
        "pitfalls": [
          "Extract in a fresh location and inspect member paths first.",
          "If the archive is incomplete, check whether the prompt supplies additional parts.",
          "A protected archive is not automatically an instruction to perform a large password attack."
        ],
        "sources": [
          [
            "Kali 7zip commands",
            "https://www.kali.org/tools/7zip/"
          ]
        ]
      },
      {
        "id": "misc-logs",
        "title": "Turn a small log into a testable observation",
        "lead": "This synthetic log uses a documentation IP. Practice counting failed actions and reading order, then apply the same method to supplied evidence.",
        "blocks": [
          {
            "label": "Kali Bash · invented local log",
            "code": "mkdir -p ~/hack4gov-review/log-drill\ncd ~/hack4gov-review/log-drill\ncat > events.log <<'LOG'\n2026-01-01T10:00:00Z 192.0.2.10 login FAIL\n2026-01-01T10:00:04Z 192.0.2.10 login FAIL\n2026-01-01T10:00:09Z 192.0.2.10 login OK\n2026-01-01T10:00:12Z 192.0.2.10 download OK\nLOG\ngrep ' login FAIL$' events.log\npython3 - <<'PY'\nfrom collections import Counter\nfrom pathlib import Path\nfailures = Counter()\nfor line in Path(\"events.log\").read_text().splitlines():\n    timestamp, address, action, result = line.split()\n    if action == \"login\" and result == \"FAIL\":\n        failures[address] += 1\nprint(dict(failures))\nPY",
            "explanation": "The count is {'192.0.2.10': 2}. The parser is deliberately tied to this four-field synthetic format; adapt it to the real log schema instead of assuming identical columns."
          }
        ],
        "look": "Describe the observations: two failed logins, then a successful login, then a download from one address. The sequence alone does not establish who acted or whether it was malicious.",
        "answer": "There are two FAIL entries for 192.0.2.10. A useful next question is whether the account, session, and downloaded object are related. Those facts are not present in this sample, so attribution would be speculation.",
        "pitfalls": [
          "Account for time zones, missing records, rotated files, and shared IPs.",
          "Log fields may be quoted or contain spaces; a simple split parser is not universal."
        ]
      },
      {
        "id": "misc-system",
        "title": "Know the local environment and optional memory workflow",
        "lead": "System inspection helps explain lab problems. Memory analysis is an optional extension: use a prepared Volatility 3 installation and the correct operating-system plugins.",
        "blocks": [
          {
            "label": "Kali Bash · inspect your own VM",
            "code": "uname -a\ncat /etc/os-release\nip -brief address\nss -ltn\nps -u \"$USER\"",
            "explanation": "These inspect your own OS, interfaces, listening TCP sockets, and processes. They do not enumerate an external target."
          },
          {
            "label": "Kali Bash · prepared upstream Volatility 3 lab",
            "code": "# Run from the prepared Volatility 3 source directory.\npython3 vol.py -h\npython3 vol.py -f /path/to/supplied/memory.raw windows.info\npython3 vol.py -f /path/to/supplied/memory.raw windows.pslist\npython3 vol.py -f /path/to/supplied/memory.raw windows.netscan",
            "explanation": "The path is a placeholder. These plugins target Windows memory, even when the analysis runs on Kali. Correlate process IDs and network artifacts; do not apply Windows plugins to every image."
          }
        ],
        "look": "Confirm image OS, tool compatibility, and symbols before interpreting output. Prepare symbol/dependency access before an offline event. For supplied container exercises, inspect image/configuration and files inside the isolated lab; container tools are supporting techniques, not a guaranteed category.",
        "pitfalls": [
          "Kali lists Volatility/Volatility3 among removed tools, so do not assume apt install volatility3 will work.",
          "Follow the upstream installation guide; symbol preparation can require downloads.",
          "A process name alone is insufficient to identify malicious behavior."
        ],
        "sources": [
          [
            "Volatility 3 Windows tutorial",
            "https://volatility3.readthedocs.io/en/stable/getting-started-windows-tutorial.html"
          ],
          [
            "Kali removed tools",
            "https://www.kali.org/docs/tools/removed-tools/"
          ]
        ]
      },
      {
        "id": "osint-search",
        "title": "Corroborate an evidence clue with public sources",
        "lead": "Extract distinctive words, signage, a document title, or a quoted sentence. Search the original source before widening the search.",
        "steps": [
          "Write the question you are trying to answer and list what is directly visible.",
          "Use exact phrases and a domain filter when the challenge supplies a relevant source.",
          "Open the original result and check whether it supports the exact claim.",
          "Corroborate with another independent detail: layout, landmark, publication record, or timestamp."
        ],
        "blocks": [
          {
            "label": "Search-engine box · not a terminal command",
            "code": "\"exact sentence supplied in the challenge\"\nsite:challenge.example.invalid \"distinctive phrase\"\n\"distinctive phrase\" -unrelated_keyword",
            "explanation": "Quotation marks target a phrase; site: limits a site/domain; a minus excludes a term. Replace the .invalid placeholder with the permitted source. Keep no space after site:. These are browser search queries, not Kali shell commands."
          }
        ],
        "look": "A photo match should agree on stable visual details, not just a similar building. A matching username or name can belong to another person.",
        "pitfalls": [
          "A search snippet is a lead. Read the underlying page.",
          "Two copies of the same article are not independent corroboration.",
          "Publication dates, update dates, and capture dates can describe different events."
        ],
        "sources": [
          [
            "Google search operators",
            "https://support.google.com/websearch/answer/2466433"
          ]
        ]
      }
    ]
  },
  {
    "id": "stego",
    "label": "Steganography",
    "kind": "CHALLENGE CATEGORY 04",
    "title": "Inspect the carrier.",
    "intro": "Identify the real carrier format before selecting a technique. Inspect metadata, visible content, embedded signatures, and structural anomalies. A suspicious clue guides your next test; it does not by itself prove a hidden flag.",
    "workspace": {
      "label": "Kali Bash · select this challenge workspace",
      "code": "mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}\ncd ~/hack4gov-review/challenge-01\npwd\nls -lah work/",
      "explanation": "Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence."
    },
    "notes": [
      {
        "id": "misc-stego",
        "title": "Choose a steganography tool from the carrier type",
        "lead": "Inspect file type, metadata, dimensions, and prompt hints first. For a supported carrier, Steghide can inspect or recover an embedded payload.",
        "blocks": [
          {
            "label": "Kali Bash · supported supplied image",
            "code": "file work/image.jpg\nexiftool -a -G1 -s work/image.jpg\nsteghide info work/image.jpg\nsteghide extract -sf work/image.jpg -xf results/recovered.bin\nfile results/recovered.bin\nsha256sum results/recovered.bin",
            "explanation": "Steghide can prompt for a challenge-provided passphrase. Its common carrier formats are JPEG, BMP, WAV, and AU; it is not a universal PNG extractor."
          }
        ],
        "look": "Follow the artifact type and hints. A recovered file may itself require decoding or archive analysis.",
        "pitfalls": [
          "Absence of a Steghide payload does not rule out every steganography method.",
          "A metadata field is a clue, not necessarily a flag.",
          "Do not assume any visible picture has hidden data just because it is a CTF."
        ],
        "sources": [
          [
            "Kali Steghide",
            "https://www.kali.org/tools/steghide/"
          ]
        ]
      },
      {
        "id": "stego-png",
        "title": "Inspect PNG structure before assuming hidden data",
        "lead": "Identify the supplied image and inspect its metadata, strings, and chunks. Unusual structure or appended bytes are leads to investigate; they do not prove a hidden payload.",
        "blocks": [
          {
            "label": "Kali Bash · supplied PNG triage",
            "code": "file work/image.png\nexiftool -a -u -g1 work/image.png\nstrings -a -n 6 -t x work/image.png\nbinwalk work/image.png",
            "explanation": "Use the challenge's filename in place of image.png. These inspect type, metadata, printable strings with offsets, and signature matches. Normal PNG compression can produce zlib-related findings."
          },
          {
            "label": "Kali Bash · read-only PNG chunk inventory",
            "code": "python3 - <<'PY'\nfrom pathlib import Path\nimport zlib\n\nblob = Path(\"work/image.png\").read_bytes()\nif blob[:8] != bytes.fromhex(\"89504e470d0a1a0a\"):\n    raise SystemExit(\"PNG signature mismatch\")\noffset = 8\nwhile offset + 12 <= len(blob):\n    size = int.from_bytes(blob[offset:offset + 4], \"big\")\n    tag = blob[offset + 4:offset + 8]\n    stop = offset + 12 + size\n    if size > 0x7fffffff or stop > len(blob):\n        raise SystemExit(\"Invalid or truncated chunk\")\n    stored = int.from_bytes(blob[stop - 4:stop], \"big\")\n    actual = zlib.crc32(blob[offset + 4:stop - 4]) & 0xffffffff\n    print(hex(offset), tag, size, \"CRC matches:\", stored == actual)\n    offset = stop\n    if tag == b\"IEND\":\n        print(\"Bytes after IEND:\", len(blob) - offset)\n        break\nelse:\n    raise SystemExit(\"No complete IEND chunk\")\nPY",
            "explanation": "PNG has an eight-byte signature followed by chunks with length, type, data, and CRC fields. The script follows declared lengths and checks each CRC over type plus data. It reports offsets, sizes, and any bytes after IEND."
          }
        ],
        "look": "IHDR begins a PNG datastream, IDAT carries compressed image data, and IEND ends it. Text chunks and metadata can be legitimate. Correlate an interesting offset with the prompt and other evidence before extracting or decoding.",
        "pitfalls": [
          "This inventory checks basic bounds and CRCs, not every PNG ordering rule or the decoded image. A matching CRC does not establish authenticity.",
          "Searching for the first literal IEND string is unreliable because those bytes can occur inside chunk data.",
          "Strings and Binwalk can miss pixel-level steganography. A clean result does not rule out hidden data; signature hits and trailing bytes are not proof by themselves."
        ],
        "sources": [
          [
            "W3C PNG specification: signature and chunks",
            "https://www.w3.org/TR/png/"
          ],
          [
            "Python CRC32",
            "https://docs.python.org/3/library/zlib.html#zlib.crc32"
          ],
          [
            "GNU strings",
            "https://sourceware.org/binutils/docs/binutils/strings.html"
          ],
          [
            "Kali ExifTool package",
            "https://www.kali.org/tools/libimage-exiftool-perl/"
          ],
          [
            "Kali Binwalk documentation",
            "https://www.kali.org/tools/binwalk/"
          ]
        ]
      }
    ]
  },
  {
    "id": "web",
    "label": "Web security",
    "kind": "CHALLENGE CATEGORY 05",
    "title": "Read the request.",
    "intro": "Set a baseline before testing inputs. Observe methods, parameters, headers, cookies, and response content. Use only your local practice app or the assigned competition application.",
    "notes": [
      {
        "id": "web-baseline",
        "title": "Capture the actual HTTP response",
        "lead": "Use the local lab from Kali setup to practice. In an assigned application, replace BASE_URL only with the provided in-scope origin.",
        "blocks": [
          {
            "label": "Kali Bash · GET baseline",
            "code": "mkdir -p results\nBASE_URL='http://127.0.0.1:8000'\ncurl -sS -D results/headers.txt -o results/body.html \"$BASE_URL/\"\ncat results/headers.txt\nless results/body.html",
            "explanation": "-sS hides the progress meter while keeping errors; -D writes headers; -o writes the body. This sends a GET. curl -I sends HEAD, which an application can handle differently."
          }
        ],
        "look": "Read the status, Location, Content-Type, Set-Cookie, page title, and body. HTTP 200 can still contain a login page or a generic error. Inspect redirect destinations before following them.",
        "pitfalls": [
          "A refused connection usually means the local server is not running or the port is wrong.",
          "Do not add -k as a default TLS workaround. Use the provided hostname/certificate setup.",
          "Keep every followed redirect within the assigned scope."
        ],
        "sources": [
          [
            "curl tutorial",
            "https://curl.se/docs/tutorial.html"
          ],
          [
            "HTTP status meanings",
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status"
          ]
        ]
      },
      {
        "id": "web-map",
        "title": "Map visible clues before discovery",
        "lead": "Browse normally and inspect source comments, links, forms, scripts, robots.txt, and sitemap.xml. Use a small discovery list only if the assigned lab allows it.",
        "blocks": [
          {
            "label": "Kali Bash · local clue files",
            "code": "curl -sS \"$BASE_URL/robots.txt\"\ncurl -sS \"$BASE_URL/sitemap.xml\"\ncurl -sS \"$BASE_URL/a-path-that-does-not-exist\"",
            "explanation": "Compare a deliberately nonexistent path with interesting responses. The local setup lab has robots.txt but no sitemap.xml; a 404 for the latter is expected."
          },
          {
            "label": "Kali Bash · bounded discovery, if permitted",
            "code": "printf '%s\\n' robots.txt sitemap.xml help about > paths.txt\nffuf -w paths.txt -u \"$BASE_URL/FUZZ\" -t 2 -rate 2 \\\n  -maxtime 30 -mc all -o results/discovery.json -of json",
            "explanation": "FUZZ marks the replacement position. This example uses four paths, two workers, at most two requests per second, and a 30-second cap. Compare status, size, words, and lines; then verify meaningful results manually."
          }
        ],
        "look": "An exposed script may reference a source map through a SourceMap header or sourceMappingURL comment. Inspect the map actually linked by the lab; resolve a relative URL against the script URL.",
        "pitfalls": [
          "Wildcard/generic error responses can make every path look like a match.",
          "robots.txt describes crawler behavior and grants no testing authorization.",
          "Do not treat a framework name, version guess, or discovered path as a confirmed vulnerability."
        ],
        "sources": [
          [
            "Kali ffuf options",
            "https://www.kali.org/tools/ffuf/"
          ],
          [
            "Robots protocol",
            "https://datatracker.ietf.org/doc/html/rfc9309"
          ],
          [
            "SourceMap header",
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/SourceMap"
          ]
        ]
      },
      {
        "id": "web-burp",
        "title": "Observe and replay one request in Burp",
        "lead": "Burp helps you inspect a request as a whole instead of guessing from the visible page.",
        "steps": [
          "Launch Burp, create a temporary practice project, and add only the assigned origin to target scope.",
          "In Proxy → Intercept, open Burp's browser. Keep interception off while browsing; HTTP history still records traffic.",
          "Turn interception on for one action, inspect the held request, and click Forward. Turn it off afterward.",
          "In HTTP history, send a useful request to Repeater. Send the unchanged baseline first.",
          "Change one input and compare status, headers, response body, and the expected access rules. Keep the method, session cookies, and required tokens."
        ],
        "blocks": [
          {
            "label": "Kali Bash · start the GUI",
            "code": "burpsuite",
            "explanation": "Use Burp's configured browser for the practice site. A page waiting to load may simply have a request held in Intercept."
          }
        ],
        "look": "A useful record contains the baseline request, modified request, relevant response, and your conclusion. Mark a clue as suspected until a controlled comparison confirms it.",
        "pitfalls": [
          "A proxy configuration problem is not an application vulnerability.",
          "A changed CSRF token or expired session can explain a different response.",
          "Do not forward a request to an out-of-scope origin."
        ],
        "sources": [
          [
            "Burp target scope",
            "https://portswigger.net/burp/documentation/desktop/getting-started/setting-target-scope"
          ],
          [
            "Burp interception",
            "https://portswigger.net/burp/documentation/desktop/getting-started/intercepting-http-traffic"
          ],
          [
            "Burp Repeater",
            "https://portswigger.net/burp/documentation/desktop/getting-started/reissuing-http-requests"
          ]
        ]
      },
      {
        "id": "web-session",
        "title": "Understand cookies, sessions, and form data",
        "lead": "Use the application's supplied demo account and normal login flow. Saving cookies alone does not authenticate you.",
        "blocks": [
          {
            "label": "Kali Bash · application with a cookie-based demo session",
            "code": "curl -sS -c results/cookies.txt -o results/start.html \"$BASE_URL/\"\ncurl -sS -b results/cookies.txt -c results/cookies.txt \\\n  -D results/session.headers -o results/session.html \"$BASE_URL/profile\"",
            "explanation": "-c writes the cookie jar; -b sends cookies from it. The first GET is only a starting-page request, not a login. Between these two commands, perform the actual application-specific login request with -c results/cookies.txt. This /profile example needs an assigned app implementing that route; the static local practice server has neither accounts nor sessions."
          }
        ],
        "look": "Compare the authenticated and unauthenticated responses. Check cookie host/path/expiry, the request method, and anti-CSRF requirements before interpreting differences.",
        "pitfalls": [
          "An HTML login form returned with 200 is not an authenticated profile.",
          "Do not publish live challenge cookies or session tokens in your notes.",
          "Do not confuse a token's visible encoding with whether it is trusted or signed."
        ],
        "sources": [
          [
            "curl HTTP scripting",
            "https://curl.se/docs/httpscripting.html"
          ],
          [
            "curl cookie options",
            "https://curl.se/docs/manpage.html"
          ]
        ],
        "steps": [
          "Inspect the assigned application’s real login request in the browser or Burp. Identify its method, endpoint, form fields, and any CSRF token.",
          "Replay that application-specific login request with curl and -c results/cookies.txt so the resulting session cookies are saved. A login in your browser does not fill curl’s separate cookie jar. Alternatively, use the authenticated request copied from your browser or Burp, preserving its cookies and tokens.",
          "Then request the profile with the same session, as shown below. Confirm the response is an authenticated page rather than a login form."
        ]
      },
      {
        "id": "web-hypotheses",
        "title": "Test a vulnerability hypothesis in the assigned toy app",
        "lead": "Start with a working request and change one thing. These checks describe deliberately vulnerable exercises, not the static practice server.",
        "steps": [
          "Access control / IDOR: use two supplied demo accounts and two known objects. As account A, compare access to A's object with B's private toy object. Inspect ownership and content, not just status.",
          "Path traversal: if the prompt gives a file-reading exercise, compare welcome.txt with a harmless supplied fixture such as ../ctf-note.txt. Confirm that content came from outside the intended directory.",
          "SQL injection: in a supplied vulnerable search form, compare a normal value with a single quote. A database-specific error is a lead; seek a bounded confirmation in the intended exercise.",
          "Record the cause and a defensive fix: server-side authorization, path allowlists/canonicalization, or parameterized database queries."
        ],
        "blocks": [
          {
            "label": "Kali Bash · supplied vulnerable search exercise only",
            "code": "curl -sS -G --data-urlencode 'q=hello' \"$BASE_URL/search\"\ncurl -sS -G --data-urlencode \"q='\" \"$BASE_URL/search\"",
            "explanation": "-G puts URL-encoded data into a GET query. A generic 500 error is not proof of SQL injection. This example stops at hypothesis testing and does not extract a database."
          }
        ],
        "look": "Use observed, suspected, and confirmed accurately. A reproducible baseline plus one controlled change is more useful than a screenshot of an unexplained error.",
        "pitfalls": [
          "A changed identifier with HTTP 200 does not prove IDOR if the response is public or belongs to the same account.",
          "Silence or lack of errors does not establish safety.",
          "Apply each test only when the prompt, scope, and application make it relevant."
        ],
        "sources": [
          [
            "OWASP IDOR testing",
            "https://wstg.owasp.org/v4.1/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References/"
          ],
          [
            "OWASP traversal testing",
            "https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/05-Authorization_Testing/01-Testing_Directory_Traversal_File_Include/"
          ],
          [
            "OWASP SQL injection testing",
            "https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection/"
          ]
        ]
      }
    ],
    "workspace": {
      "label": "Kali Bash · select this challenge workspace",
      "code": "mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}\ncd ~/hack4gov-review/challenge-01\npwd\nls -lah work/",
      "explanation": "Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence."
    }
  },
  {
    "id": "network",
    "label": "Network security",
    "kind": "CHALLENGE CATEGORY 06",
    "title": "Understand the traffic.",
    "intro": "Analyze supplied packet captures offline to understand protocols, conversations, transferred objects, and timing. DNS records and service discovery can help when the challenge assigns a domain or target; active commands require the permitted scope.",
    "notes": [
      {
        "id": "network-orient",
        "title": "Get the capture's shape before filtering",
        "lead": "Replace capture.pcapng with the provided PCAP/PCAPNG file. Work on a copy and start with duration, protocol mix, and endpoint pairs.",
        "blocks": [
          {
            "label": "Kali Bash · offline capture",
            "code": "capinfos work/capture.pcapng\ntshark -n -r work/capture.pcapng -q -z io,phs\ntshark -n -r work/capture.pcapng -q -z conv,tcp\ntshark -n -r work/capture.pcapng -q -z endpoints,ip",
            "explanation": "capinfos reports file/capture metadata. -r reads a file; -n disables name resolution; -q reduces packet-line output. The statistics identify protocol mix, conversations, and endpoints."
          }
        ],
        "look": "Pick a concrete lead: a notable protocol, large transfer, repeated connection, or time window. In Wireshark, use Statistics → Protocol Hierarchy, Conversations, and Endpoints.",
        "pitfalls": [
          "Traffic volume or an unfamiliar host is not proof of a threat.",
          "A capture may start late or omit packets.",
          "A display filter does not automatically constrain every statistics option."
        ],
        "sources": [
          [
            "Capinfos manual",
            "https://www.wireshark.org/docs/man-pages/capinfos.html"
          ],
          [
            "TShark manual",
            "https://www.wireshark.org/docs/man-pages/tshark.html"
          ]
        ]
      },
      {
        "id": "network-filters",
        "title": "Use display filters, not capture-filter syntax",
        "lead": "Paste these expressions into Wireshark's display-filter bar, or use them after TShark -Y. They operate on a saved capture.",
        "blocks": [
          {
            "label": "Wireshark display-filter bar · one expression at a time",
            "code": "dns\ndns.flags.response == 0\ndns.flags.rcode != 0\nhttp.request\nhttp.request.method == \"POST\"\nhttp.response.code >= 400\ntcp.stream == 4\ntcp.flags.syn == 1 && tcp.flags.ack == 0\ntcp.analysis.retransmission\nip.addr == 192.0.2.10",
            "explanation": "dns.flags.response == 0 selects queries; rcode != 0 highlights DNS error codes. tcp.stream chooses a conversation. The IP is a documentation example to replace with an endpoint already seen in the file."
          }
        ],
        "look": "Ask which packets satisfy your hypothesis. A stream index starts at zero and must be discovered in your capture. No result may mean the chosen stream or decoded protocol is absent.",
        "pitfalls": [
          "tcp port 80 is capture-filter syntax; tcp.port == 80 is a display filter.",
          "Quotes and case matter in expressions.",
          "HTTPS traffic may show TLS without readable HTTP fields."
        ],
        "sources": [
          [
            "Display-filter syntax",
            "https://www.wireshark.org/docs/man-pages/wireshark-filter.html"
          ],
          [
            "DNS fields",
            "https://www.wireshark.org/docs/dfref/d/dns.html"
          ],
          [
            "HTTP fields",
            "https://www.wireshark.org/docs/dfref/h/http.html"
          ],
          [
            "TCP fields",
            "https://www.wireshark.org/docs/dfref/t/tcp.html"
          ]
        ]
      },
      {
        "id": "network-tables",
        "title": "Extract a small DNS and HTTP evidence table",
        "lead": "Export fields you can compare instead of reading every packet. Keep the frame number so you can return to the original evidence.",
        "blocks": [
          {
            "label": "Kali Bash · DNS table",
            "code": "tshark -n -r work/capture.pcapng -Y 'dns' -T fields \\\n  -E header=y -E separator=, -E quote=d \\\n  -e frame.number -e ip.src -e dns.flags.response \\\n  -e dns.qry.name -e dns.a > results/dns.csv",
            "explanation": "This records frame, sender, query/response state, requested name, and IPv4 answers. Some rows legitimately have no answer field."
          },
          {
            "label": "Kali Bash · HTTP requests",
            "code": "tshark -n -r work/capture.pcapng -Y 'http.request' -T fields \\\n  -E header=y -E separator=, -E quote=d \\\n  -e frame.number -e tcp.stream -e http.request.method \\\n  -e http.host -e http.request.uri > results/http.csv",
            "explanation": "-T fields and -e choose columns. Compare host, method, path, and stream. Empty output can reflect encryption or missing HTTP dissection, not an absence of all web traffic."
          }
        ],
        "look": "Connect a DNS name to an endpoint, then to a relevant request and stream. Keep that chain in your solution notes.",
        "pitfalls": [
          "An IPv6 answer is in dns.aaaa rather than dns.a.",
          "Encrypted DNS may not appear as plain dns fields.",
          "A name in a packet is a clue, not an attribution conclusion."
        ],
        "sources": [
          [
            "Kali TShark options",
            "https://www.kali.org/tools/wireshark/"
          ],
          [
            "DNS field reference",
            "https://www.wireshark.org/docs/dfref/d/dns.html"
          ],
          [
            "HTTP field reference",
            "https://www.wireshark.org/docs/dfref/h/http.html"
          ]
        ]
      },
      {
        "id": "network-stream",
        "title": "Follow a conversation and recover transferred objects",
        "lead": "Select a promising packet and use Analyze → Follow → TCP Stream in Wireshark. Replace stream 4 with the index you found.",
        "blocks": [
          {
            "label": "Kali Bash · offline reconstruction",
            "code": "tshark -n -r work/capture.pcapng -q -z 'follow,tcp,ascii,4'\nmkdir -p results/http-objects\ntshark -n -r work/capture.pcapng -q \\\n  --export-objects http,results/http-objects/\nfind results/http-objects -type f -exec file {} \\;",
            "explanation": "The first command shows a readable conversation. The export command reconstructs available HTTP objects. Identify recovered files before opening them, and preserve their hashes."
          }
        ],
        "look": "Inspect request/response order, filenames, bodies, and encoded content. Use a raw save or export for byte-exact binary analysis rather than copying an ASCII view.",
        "pitfalls": [
          "Following TCP does not decrypt HTTPS. Suitable TLS secrets and a compatible capture are needed for decryption.",
          "Reassembly may be incomplete if packets are missing.",
          "Treat recovered binaries as artifacts for static analysis, not programs to launch on your host."
        ],
        "sources": [
          [
            "Follow-stream guide",
            "https://www.wireshark.org/docs/wsug_html_chunked/ChAdvFollowStreamSection.html"
          ],
          [
            "HTTP object export",
            "https://www.wireshark.org/docs/wsug_html_chunked/ChIOExportSection.html"
          ],
          [
            "TShark export/follow options",
            "https://www.wireshark.org/docs/man-pages/tshark.html"
          ]
        ]
      },
      {
        "id": "network-timeline",
        "title": "Build an incident timeline",
        "lead": "Use timestamps, endpoint pairs, and frame numbers to explain a sequence: initial connection, request, transfer, and later activity.",
        "blocks": [
          {
            "label": "Kali Bash · packet timeline",
            "code": "tshark -n -r work/capture.pcapng -T fields \\\n  -E header=y -E separator=, -E quote=d \\\n  -e frame.number -e frame.time_epoch -e ip.src -e ip.dst \\\n  -e tcp.stream -e _ws.col.Protocol -e _ws.col.Info \\\n  > results/timeline.csv",
            "explanation": "Epoch timestamps help compare captures and logs without relying on a displayed local time zone. Add the relevant stream and frame references to your written timeline."
          }
        ],
        "look": "Separate the observed sequence from your interpretation. Tie a claim about a transferred file back to its frame, stream, recovered content, and hash.",
        "pitfalls": [
          "Clock skew, missing time-zone information, NAT, and shared endpoints can complicate correlation.",
          "Do not claim an incident solely because a traffic pattern looks unusual."
        ],
        "sources": [
          [
            "Wireshark/TShark field output",
            "https://www.kali.org/tools/wireshark/"
          ]
        ]
      },
      {
        "id": "network-active",
        "title": "Use scoped service discovery when assigned",
        "lead": "This is active testing, unlike PCAP analysis. Practice against the local server from Kali setup; change the target and ports only to match the organizer's permitted scope.",
        "blocks": [
          {
            "label": "Kali Bash · local service example",
            "code": "TARGET_IP='127.0.0.1'\nnmap -sT -sV --version-light -n -p 8000 \\\n  -oN results/services.txt \"$TARGET_IP\"",
            "explanation": "-sT uses TCP connections; -sV probes service information; --version-light reduces version probing; -p selects a port; -n skips DNS; -oN saves the result. This example checks one local port and needs no raw-packet scan privileges."
          }
        ],
        "look": "Read PORT, STATE, SERVICE, and VERSION separately. open indicates a listening service; closed indicates no listener was found; filtered means Nmap could not determine openness because probes/responses were obstructed.",
        "pitfalls": [
          "A version guess does not establish a vulnerability.",
          "Do not substitute a government website or all discovered IPs for an assigned target.",
          "Connection, VPN, firewall, and scan-scope issues can explain missing responses."
        ],
        "sources": [
          [
            "Nmap options",
            "https://nmap.org/book/man-briefoptions.html"
          ],
          [
            "TCP connect scanning",
            "https://nmap.org/book/man-port-scanning-techniques.html"
          ],
          [
            "Nmap port states",
            "https://nmap.org/book/man-port-scanning-basics.html"
          ]
        ]
      },
      {
        "id": "osint-dns",
        "title": "Connect domain records and keep an evidence ledger",
        "lead": "For a domain assigned in a challenge, DNS and registration records can explain infrastructure relationships. The example domain below is intentionally invalid.",
        "blocks": [
          {
            "label": "Kali Bash · replace with a permitted domain",
            "code": "DOMAIN='challenge.example.invalid'\ndig \"$DOMAIN\" A +noall +answer\ndig \"$DOMAIN\" MX +noall +answer\ndig \"$DOMAIN\" TXT +noall +answer\nwhois \"$DOMAIN\"",
            "explanation": "A records are IPv4 addresses; MX records identify mail routing; TXT records contain text. WHOIS may be redacted or unavailable. A missing answer can reflect record type, resolver behavior, or a nonexistent name; it is not a complete history."
          },
          {
            "label": "Kali Bash · local evidence ledger",
            "code": "mkdir -p results\nprintf 'claim\\tsource_url\\tobservation\\ttime_zone\\tconfidence\\n' \\\n  > results/osint-evidence.tsv",
            "explanation": "Add one row per claim. Save enough context to reproduce it: the original URL, supporting detail, relevant date/time zone, and your confidence."
          }
        ],
        "look": "Ask whether records show a real relationship or simply a shared provider/CDN. Separate direct observations from conclusions in your write-up.",
        "pitfalls": [
          "Reverse DNS and registration names do not prove ownership of a specific challenge service.",
          "Do not infer broad scanning scope from a discovered hostname."
        ],
        "sources": [
          [
            "Kali DNS utilities",
            "https://www.kali.org/tools/bind9/"
          ],
          [
            "Kali WHOIS",
            "https://www.kali.org/tools/whois/"
          ]
        ]
      }
    ],
    "workspace": {
      "label": "Kali Bash · select this challenge workspace",
      "code": "mkdir -p ~/hack4gov-review/challenge-01/{original,work,results}\ncd ~/hack4gov-review/challenge-01\npwd\nls -lah work/",
      "explanation": "Replace challenge-01 with your own challenge folder. Supplied-artifact commands below assume this working directory and files copied into work/. Local drills change folders; return here before analyzing challenge evidence."
    }
  },
  {
    "id": "competition",
    "label": "Competition plan",
    "kind": "ON THE DAY",
    "title": "Keep a clear trail.",
    "intro": "Hack4Gov is a Jeopardy-style CTF. Review the six challenge categories you confirmed: cryptography, reverse engineering, digital forensics, steganography, web security, and network security. Each independent solve submits a flag for points. Use the event platform for its actual points, scoring, team rules, targets, and flag syntax.",
    "notes": [
      {
        "id": "competition-triage",
        "title": "Triage before going deep",
        "lead": "Start by surveying the Jeopardy challenge board. Pick tractable independent challenges, keep leads, and return to harder ones with better evidence.",
        "steps": [
          "Scan the category-based board. Note each prompt, supplied artifacts, points as displayed, hints, and a possible first test.",
          "Prioritize challenges where you recognize the artifact or technique. Use displayed points as one signal, not a guaranteed measure of difficulty.",
          "Write one hypothesis and the observation that would support or contradict it.",
          "Run the smallest useful test, record its output, and decide the next step.",
          "Timebox a dead end when no new evidence appears. Record the attempted commands and next lead, switch to another challenge, and coordinate owners according to the event's team rules."
        ],
        "look": "Your notes should answer: what did I observe, what did I test, what changed, and what should I try next?",
        "pitfalls": [
          "Tool output is not a conclusion.",
          "Do not assume points, time limits, team size, or a flag prefix from this reviewer.",
          "More aggressive scanning is not a substitute for reading the prompt."
        ]
      },
      {
        "id": "competition-writeup",
        "title": "Keep a reusable solution template",
        "lead": "Record enough detail for your future self to reproduce the solve. The shared slides emphasize investigation, evidence analysis, and technical reporting.",
        "blocks": [
          {
            "label": "Kali Bash · create your local write-up",
            "code": "mkdir -p results\ncat > results/solution.md <<'NOTES'\n# Challenge title\nCategory:\nOfficial flag format:\nAssigned scope:\nArtifact names and SHA-256:\n## Observations\n## Hypothesis\n## Commands and relevant output\n## Evidence\nFrame / stream / URL / file offset:\nTime zone:\n## Result\nFlag verified against the platform:\n## Cause and defensive improvement\n## Remaining uncertainty\nNOTES",
            "explanation": "Edit the file in a text editor. Save relevant excerpts, not just a terminal screenshot. Keep actual session tokens and sensitive event-only material out of public write-ups."
          }
        ],
        "look": "Include the exact command, why you ran it, and the evidence that changed your conclusion. When the task concerns a vulnerability, add its cause and a practical mitigation.",
        "pitfalls": [
          "A finding without evidence is hard to reproduce.",
          "Do not claim the event accepted a flag unless the platform actually did."
        ]
      },
      {
        "id": "competition-final",
        "title": "Check the last mile before submitting",
        "lead": "Validate the answer against the prompt and organizer's required format. Review flags are examples, not real event answers.",
        "steps": [
          "Check capitalization, braces, punctuation, whitespace, and whether the prompt asks for a flag or a specific fact.",
          "If a transformation produced binary data, inspect its type instead of forcing text decoding.",
          "Confirm that your evidence answers this challenge, not merely a related clue.",
          "Submit through the designated competition platform and note its actual response.",
          "Keep your solve record and follow the event's publication rules afterward."
        ],
        "look": "A correct-looking string is still a candidate until its context and required format agree. Copy only the answer, not terminal prompts or extra newlines.",
        "pitfalls": [
          "Do not invent a HackForGov flag prefix. The provided slides do not specify one.",
          "Only the competition platform can confirm acceptance."
        ]
      }
    ]
  },
  {
    "id": "web-exploitation",
    "label": "Web exploitation",
    "kind": "08 / WEB EXPLOITATION",
    "title": "See the effect. Explain the cause.",
    "intro": "Practice after reviewing 05: Web security. Compare the vulnerable and corrected behavior in these small local labs. Run command blocks in Kali’s Terminal; keep a server’s terminal running while using the second terminal or browser. Expected-output blocks describe results.",
    "notes": [
      {
        "id": "webex-sql-logic",
        "title": "SQL injection: change logic in a toy query",
        "lead": "Kali Bash + Python 3 only. This invented in-memory users table demonstrates how input becomes SQL syntax and how parameter binding fixes it. No server or real database is contacted.",
        "blocks": [
          {
            "label": "Run the local SQLite comparison",
            "code": "python3 - <<'PY'\nimport sqlite3\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE users (name TEXT, password TEXT)\")\ndb.executemany(\"INSERT INTO users VALUES (?, ?)\",\n               [(\"alice\", \"demo-only\"), (\"bob\", \"another-demo\")])\n\ndef unsafe_login(name, password):\n    query = (f\"SELECT COUNT(*) FROM users WHERE name = '{name}' \"\n             f\"AND password = '{password}'\")\n    return db.execute(query).fetchone()[0] > 0\n\ndef safe_login(name, password):\n    query = \"SELECT COUNT(*) FROM users WHERE name = ? AND password = ?\"\n    return db.execute(query, (name, password)).fetchone()[0] > 0\n\npayload = \"' OR 1=1 -- \"\nprint(\"unsafe normal wrong:\", unsafe_login(\"alice\", \"wrong\"))\nprint(\"unsafe altered predicate:\", unsafe_login(payload, \"wrong\"))\nprint(\"safe altered value:\", safe_login(payload, \"wrong\"))\nprint(\"safe demo login:\", safe_login(\"alice\", \"demo-only\"))\ndb.close()\nPY",
            "explanation": "The unsafe function inserts supplied text directly into SQL. In the fixed toy input, a quote ends the string, OR 1=1 makes the predicate true, and -- comments out the remaining password check. The safe function binds both values to ? placeholders, so the same characters remain data. Only boolean results from two dummy rows are printed."
          },
          {
            "label": "Expected output",
            "code": "unsafe normal wrong: False\nunsafe altered predicate: True\nsafe altered value: False\nsafe demo login: True",
            "explanation": "The wrong password fails normally. The unsafe query accepts the altered predicate; the parameterized query rejects that literal name. A normal supplied demo login still succeeds, confirming the corrected function does not merely deny everything.",
            "copyable": false
          }
        ],
        "look": "Compare the constructed WHERE clause with the parameterized WHERE clause; locate exactly where the supplied quote changes the query's grammar. Record the normal, changed, and corrected outcomes. A generic error alone would not establish SQL injection in an actual assigned lab.",
        "pitfalls": [
          "This fixture is deliberately specific to SQLite and this query shape. SQL dialects, string contexts, and application behavior differ.",
          "Do not quote the ? placeholders or replace them with f-string interpolation. Binding values is what keeps code and data separate.",
          "The invented plaintext demo passwords simplify the example; the fixture is not a password-storage design. No extraction, automated scanning, or external targets are part of this exercise."
        ],
        "sources": [
          [
            "Python sqlite3: placeholders and in-memory connections",
            "https://docs.python.org/3/library/sqlite3.html"
          ],
          [
            "OWASP SQL Injection Prevention",
            "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
          ]
        ]
      },
      {
        "id": "webex-reflected-xss",
        "title": "Reflected XSS: prove execution with a local marker",
        "lead": "Kali Bash + Python 3 and a browser on the same Kali machine. Work in a disposable practice folder. The app binds to 127.0.0.1:8765; its fixed payload only changes a visible page marker. Stop it with Ctrl+C.",
        "blocks": [
          {
            "label": "Start the toy app in terminal 1",
            "code": "mkdir -p ~/hack4gov-review/web-exploitation/xss\ncd ~/hack4gov-review/web-exploitation/xss\ncat > xss_lab.py <<'PY'\nfrom html import escape\nfrom http.server import BaseHTTPRequestHandler, HTTPServer\nfrom urllib.parse import parse_qs, urlencode, urlsplit\n\nPAYLOAD = \"<svg onload=\\\"document.getElementById('marker').textContent='XSS executed'\\\"></svg>\"\n\ndef render(path, value):\n    reflected = escape(value) if path == \"/safe\" else value\n    return (\"<!doctype html><meta charset='utf-8'><title>Local XSS lab</title>\"\n            \"<h1>Local reflection lab</h1><p id='marker'>Not executed</p>\"\n            \"<div>\" + reflected + \"</div>\").encode(\"utf-8\")\n\nclass Handler(BaseHTTPRequestHandler):\n    def do_GET(self):\n        request = urlsplit(self.path)\n        if request.path not in (\"/unsafe\", \"/safe\"):\n            self.send_error(404)\n            return\n        value = parse_qs(request.query).get(\"q\", [\"\"])[0]\n        body = render(request.path, value)\n        self.send_response(200)\n        self.send_header(\"Content-Type\", \"text/html; charset=utf-8\")\n        self.send_header(\"Content-Length\", str(len(body)))\n        self.end_headers()\n        self.wfile.write(body)\n\nif __name__ == \"__main__\":\n    server = HTTPServer((\"127.0.0.1\", 8765), Handler)\n    for route in (\"unsafe\", \"safe\"):\n        print(f\"http://127.0.0.1:8765/{route}?{urlencode({'q': PAYLOAD})}\", flush=True)\n    try:\n        server.serve_forever()\n    except KeyboardInterrupt:\n        pass\n    finally:\n        server.server_close()\nPY\npython3 xss_lab.py",
            "explanation": "The server prints two encoded local URLs. Open both in your own browser. The unsafe route inserts q directly into HTML text; the safe route passes q through html.escape. The marker appears before the injected SVG, so the onload handler can find it. The fixed JavaScript makes no external requests and accesses no credentials."
          },
          {
            "label": "Expected visible browser comparison",
            "code": "/unsafe: marker changes to XSS executed\n/safe: marker stays Not executed; markup appears as text",
            "explanation": "The unsafe page treats supplied markup as an SVG element and executes its event handler. The safe page displays the same value as text. Read page source to compare raw <svg with escaped &lt;svg. A reflected string in an HTTP response is not yet proof of JavaScript execution; the visible browser marker supplies that evidence in this toy app.",
            "copyable": false
          }
        ],
        "look": "Identify the input q, the HTML text reflection point, and the visible side effect. Explain the complete input-to-execution path. Revisit the safe URL and verify that the marker remains unchanged while the supplied text is still displayed.",
        "pitfalls": [
          "Use the browser on the machine running this server. A different machine's localhost points to itself.",
          "curl prints response bytes; it does not run browser JavaScript. A reflected payload or status 200 alone does not confirm XSS.",
          "html.escape is appropriate for this HTML text context. JavaScript, CSS, URL, and other contexts require the corresponding defenses.",
          "If port 8765 is occupied, choose another unused loopback port and update both the server address and the printed URL port together."
        ],
        "sources": [
          [
            "PortSwigger: reflected XSS and browser confirmation",
            "https://portswigger.net/web-security/cross-site-scripting/reflected"
          ],
          [
            "OWASP Cross Site Scripting Prevention",
            "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
          ],
          [
            "Python html.escape",
            "https://docs.python.org/3/library/html.html"
          ],
          [
            "Python HTTPServer and request handlers",
            "https://docs.python.org/3/library/http.server.html"
          ]
        ]
      },
      {
        "id": "webex-client-price",
        "title": "Business logic: tamper with a client-supplied price",
        "lead": "Kali Bash + Python 3 + curl. This local toy checkout calculates a total without creating an order or taking payment. Work in a disposable practice folder. It binds to 127.0.0.1:8766; stop it with Ctrl+C.",
        "blocks": [
          {
            "label": "Start the toy checkout in terminal 1",
            "code": "mkdir -p ~/hack4gov-review/web-exploitation/pricing\ncd ~/hack4gov-review/web-exploitation/pricing\ncat > price_lab.py <<'PY'\nimport json\nfrom http.server import BaseHTTPRequestHandler, HTTPServer\nfrom urllib.parse import parse_qs\n\nCATALOG = {\"sticker\": 500}\n\ndef total(path, fields):\n    product = fields[\"product\"][0]\n    qty = int(fields[\"qty\"][0])\n    if product not in CATALOG or not 1 <= qty <= 10:\n        raise ValueError(\"Invalid product or quantity\")\n    price = int(fields[\"price_cents\"][0]) if path == \"/unsafe\" else CATALOG[product]\n    if not 1 <= price <= 50000:\n        raise ValueError(\"Invalid price\")\n    return price * qty\n\nclass Handler(BaseHTTPRequestHandler):\n    def do_POST(self):\n        if self.path not in (\"/unsafe\", \"/safe\"):\n            self.send_error(404)\n            return\n        try:\n            length = int(self.headers.get(\"Content-Length\", \"0\"))\n            if not 0 < length <= 2048:\n                raise ValueError(\"Invalid request size\")\n            fields = parse_qs(self.rfile.read(length).decode(\"utf-8\"))\n            body = json.dumps({\"total_cents\": total(self.path, fields)}).encode(\"utf-8\")\n        except (ValueError, KeyError, IndexError):\n            self.send_error(400, \"Invalid toy order\")\n            return\n        self.send_response(200)\n        self.send_header(\"Content-Type\", \"application/json\")\n        self.send_header(\"Content-Length\", str(len(body)))\n        self.end_headers()\n        self.wfile.write(body)\n\nif __name__ == \"__main__\":\n    server = HTTPServer((\"127.0.0.1\", 8766), Handler)\n    print(\"Toy checkout: http://127.0.0.1:8766 (Ctrl+C to stop)\", flush=True)\n    try:\n        server.serve_forever()\n    except KeyboardInterrupt:\n        pass\n    finally:\n        server.server_close()\nPY\npython3 price_lab.py",
            "explanation": "Both routes validate the toy product and quantity. The unsafe route accepts price_cents from the request. The safe route obtains the price from its own catalog, where each sticker costs 500 cents. This isolates a business-rule failure even when the incoming value is a valid positive integer."
          },
          {
            "label": "Compare three POST requests in terminal 2",
            "code": "curl -sS -w '\n' -d 'product=sticker&qty=2&price_cents=500' http://127.0.0.1:8766/unsafe\ncurl -sS -w '\n' -d 'product=sticker&qty=2&price_cents=1' http://127.0.0.1:8766/unsafe\ncurl -sS -w '\n' -d 'product=sticker&qty=2&price_cents=1' http://127.0.0.1:8766/safe",
            "explanation": "curl -d submits URL-encoded form data using POST. The second request changes only the submitted price from 500 cents to 1 cent. The third submits that same tampered value to the corrected route. There are no real orders, funds, or accounts in this fixture."
          },
          {
            "label": "Expected response bodies, in request order",
            "code": "{\"total_cents\": 1000}\n{\"total_cents\": 2}\n{\"total_cents\": 1000}",
            "explanation": "The unsafe route reduces the total based on the client's price. The safe route computes 2 × 500 from server-owned values despite the tampered form field. Hidden fields, disabled inputs, and browser-side validation cannot establish an authoritative product price.",
            "copyable": false
          }
        ],
        "look": "Hold product and quantity constant, change one input, and compare the returned total with the catalog's intended rule. Distinguish syntactic validation from business validation: 1 is a valid integer but is not the catalog price for this product.",
        "pitfalls": [
          "An altered field is not a vulnerability unless the server accepts it in a way that violates the intended rule.",
          "The safe route illustrates authoritative pricing; a production checkout also needs its own authorization, stock, currency, and transaction handling.",
          "Use only this localhost fixture or an explicitly assigned toy application. Do not transfer the exercise to a real storefront.",
          "If port 8766 is occupied, change the server bind port and all three curl URLs to the same unused loopback port."
        ],
        "sources": [
          [
            "PortSwigger: excessive trust in client-side controls",
            "https://portswigger.net/web-security/logic-flaws/examples"
          ],
          [
            "curl: scripting HTTP form requests",
            "https://curl.se/docs/httpscripting.html"
          ],
          [
            "Python HTTPServer and request handlers",
            "https://docs.python.org/3/library/http.server.html"
          ]
        ]
      }
    ]
  },
  {
    "id": "linux-basics",
    "label": "Linux basics",
    "kind": "09 / LINUX BASICS",
    "title": "Get comfortable in the terminal.",
    "intro": "Open Kali’s Terminal and type bash to use Bash for these drills. Each note creates its own practice files under ~/hack4gov-review/linux-basics. Start with paths, then learn to read, search, combine commands, and check help. Run one block at a time and read its explanation.",
    "notes": [
      {
        "id": "linux-paths",
        "title": "Know where you are: pwd, cd, and ls",
        "lead": "Run this drill in Kali’s Terminal. It creates its own practice folder under ~/hack4gov-review/linux-basics; no earlier drill is required.",
        "blocks": [
          {
            "label": "Kali Bash · local path practice",
            "code": "mkdir -p \"$HOME/hack4gov-review/linux-basics/paths\"\ncd \"$HOME/hack4gov-review/linux-basics/paths\" || exit\n\nmkdir -p \"./clue folder\"\nprintf '%s\\n' 'first clue' > \"./clue folder/note.txt\"\ntouch \"./.hidden-demo\"\n\npwd\nls\nls -la\ncd \"./clue folder\" || exit\npwd\ncat \"./note.txt\"\ncd \"..\"",
            "explanation": "pwd prints your current directory: first a path ending in /linux-basics/paths, then /paths/clue folder. ls lists its contents; -a includes .hidden-demo and -l shows details such as permissions, owner, size, and modification time. cat prints first clue. The quotes keep clue folder together as one path."
          }
        ],
        "look": "An absolute path starts at /; a relative path starts from your current directory. . means here, .. means the parent, and ~ means your home directory. \"$HOME/...\" safely builds a home-based path. Directory names and filenames normally distinguish uppercase from lowercase on Kali.",
        "pitfalls": [
          "Run one block at a time and stop if setup reports an error. The cd ... || exit guard stops the shell if it cannot enter the practice folder.",
          "Do not put ~ inside quotes and expect home expansion; use \"$HOME/...\" when quoting a home-based path.",
          "ls formatting and full pwd paths vary with the terminal and username. Hidden means the name begins with a dot; it does not mean encrypted."
        ],
        "sources": [
          [
            "Bash cd and pwd",
            "https://www.gnu.org/software/bash/manual/html_node/Bourne-Shell-Builtins.html"
          ],
          [
            "Bash tilde expansion",
            "https://www.gnu.org/software/bash/manual/html_node/Tilde-Expansion.html"
          ],
          [
            "GNU ls",
            "https://www.gnu.org/software/coreutils/manual/html_node/ls-invocation.html"
          ],
          [
            "GNU filename quoting",
            "https://www.gnu.org/software/coreutils/quotes.html"
          ]
        ]
      },
      {
        "id": "linux-files",
        "title": "Create, copy, rename, and remove a practice file",
        "lead": "Run in Kali’s Terminal. This drill creates its own files inside the files subfolder; every removal names one practice copy.",
        "blocks": [
          {
            "label": "Kali Bash · local file practice",
            "code": "mkdir -p \"$HOME/hack4gov-review/linux-basics/files\"\ncd \"$HOME/hack4gov-review/linux-basics/files\" || exit\nmkdir -p \"./copies\"\n\nprintf '%s\\n' 'original practice' > \"./original.txt\"\ntouch \"./empty.txt\"\ncp -i \"./original.txt\" \"./copies/copy.txt\"\nmv -i \"./copies/copy.txt\" \"./copies/renamed.txt\"\n\nls \"./copies\"\ncat \"./copies/renamed.txt\"\nwc -c \"./empty.txt\"\n\nrm -i \"./copies/renamed.txt\"\nls \"./copies\"\ncat \"./original.txt\"",
            "explanation": "mkdir -p creates missing directories. touch creates empty.txt if absent. cp makes a copy; mv changes the copy’s name. On the first run, ls shows renamed.txt, cat prints original practice, and wc -c reports 0 bytes for empty.txt. rm -i asks before removing the named copy: enter y and press Enter to remove it. The original still prints original practice."
          }
        ],
        "look": "The -i option asks before cp or mv overwrites an existing destination; rm -i asks before removal. A repeat run may therefore ask extra questions. Review each displayed path before answering.",
        "pitfalls": [
          "touch does not empty an existing file: it updates timestamps. The 0-byte example assumes you have not added data to this drill’s empty.txt.",
          "> replaces original.txt with the shown practice text. Keep these examples in their named sandbox.",
          "rm normally removes without a recycle bin. Avoid wildcard deletion and recursive removal while learning."
        ],
        "sources": [
          [
            "GNU mkdir",
            "https://www.gnu.org/software/coreutils/manual/html_node/mkdir-invocation.html"
          ],
          [
            "GNU touch",
            "https://www.gnu.org/software/coreutils/manual/html_node/touch-invocation.html"
          ],
          [
            "GNU cp",
            "https://www.gnu.org/software/coreutils/manual/html_node/cp-invocation.html"
          ],
          [
            "GNU mv",
            "https://www.gnu.org/software/coreutils/manual/html_node/mv-invocation.html"
          ],
          [
            "GNU rm",
            "https://www.gnu.org/software/coreutils/manual/html_node/rm-invocation.html"
          ]
        ]
      },
      {
        "id": "linux-reading",
        "title": "Read text with cat, less, head, and tail",
        "lead": "Run in Kali’s Terminal. Create the four-line fixture below before reading it. less is an optional pager; the other examples work without it.",
        "blocks": [
          {
            "label": "Kali Bash · create and read local text",
            "code": "mkdir -p \"$HOME/hack4gov-review/linux-basics/reading\"\ncd \"$HOME/hack4gov-review/linux-basics/reading\" || exit\nprintf '%s\\n' 'alpha' 'beta' 'gamma' 'delta' > \"./notes.txt\"\n\ncat \"./notes.txt\"\ncat -n \"./notes.txt\"\nhead -n 2 \"./notes.txt\"\ntail -n 2 \"./notes.txt\"",
            "explanation": "cat prints all four lines. cat -n adds line numbers 1–4. head -n 2 prints alpha and beta; tail -n 2 prints gamma and delta. These commands read the file without editing it."
          },
          {
            "label": "Kali Bash · optional pager",
            "code": "command -v less\nless \"./notes.txt\"",
            "explanation": "If command -v less reports that the command exists, open the file with less. Type /gamma and press Enter to search; press q to quit. If less is unavailable, use cat, head, or tail for this drill."
          }
        ],
        "look": "Use cat for a short text file and less for a long one. head and tail help you inspect a small portion before printing a large file. This drill’s output is predictable because it creates its own fixture.",
        "pitfalls": [
          "Run the creation block first; the pager block uses its notes.txt.",
          "less is a viewer, so typing text does not edit the file. q returns to the shell.",
          "A binary artifact can contain terminal control bytes. Use file or a hex viewer for unknown challenge files before printing them as text."
        ],
        "sources": [
          [
            "GNU cat",
            "https://www.gnu.org/software/coreutils/manual/html_node/cat-invocation.html"
          ],
          [
            "GNU head",
            "https://www.gnu.org/software/coreutils/manual/html_node/head-invocation.html"
          ],
          [
            "GNU tail",
            "https://www.gnu.org/software/coreutils/manual/html_node/tail-invocation.html"
          ],
          [
            "less upstream FAQ",
            "https://www.greenwoodsoftware.com/less/faq.html"
          ]
        ]
      },
      {
        "id": "linux-search",
        "title": "Print text, search lines, and find filenames",
        "lead": "Run in Kali’s Terminal. This drill creates a tiny log and two local files; grep searches contents while find searches names.",
        "blocks": [
          {
            "label": "Kali Bash · echo, printf, and grep",
            "code": "mkdir -p \"$HOME/hack4gov-review/linux-basics/searching\"\ncd \"$HOME/hack4gov-review/linux-basics/searching\" || exit\n\necho 'Practice search'\nprintf '%s\\n' 'INFO start' 'ERROR login' 'error timeout' 'INFO done' > \"./events.log\"\n\ngrep -n 'ERROR' \"./events.log\"\ngrep -ni 'error' \"./events.log\"\ngrep -nE '^(ERROR|error)' \"./events.log\"\ngrep -nF 'INFO start' \"./events.log\"\n\ngrep -n 'MISSING' \"./events.log\"\nprintf 'grep status: %s\\n' \"$?\"",
            "explanation": "echo prints Practice search. printf '%s\\n' writes one line per argument. The grep results are 2:ERROR login; then lines 2 and 3; then lines 2 and 3 again; then 1:INFO start. -n shows line numbers, -i ignores case, -E enables extended regex, and -F treats the pattern literally. The final grep prints nothing and the next command prints grep status: 1."
          },
          {
            "label": "Kali Bash · find local log filenames",
            "code": "mkdir -p \"./logs\"\ncp -i \"./events.log\" \"./logs/session.log\"\nprintf '%s\\n' 'local clue' > \"./clue.txt\"\n\nfind \".\" -type f -name '*.log'",
            "explanation": "Run the preceding block first. find starts at the current directory, limits results to regular files with -type f, and matches the quoted filename pattern. It reports ./events.log and ./logs/session.log; their order can vary. It does not search their contents."
          }
        ],
        "look": "In the regex, ^ means the beginning of a line and | means either alternative. grep is case-sensitive unless you add -i. Its usual statuses are 0 for a match, 1 for no match, and 2 for an error; inspect $? immediately after grep.",
        "pitfalls": [
          "Quote regexes and find patterns so the shell does not expand characters such as * or interpret | before the command receives them.",
          "Use printf for controlled formatting. echo options and backslash handling can differ between shells.",
          "With printf, keep the format string fixed, such as '%s\\n', and pass text as an argument.",
          "grep status 1 means no match; it does not mean the file could not be read."
        ],
        "sources": [
          [
            "Bash printf and command builtins",
            "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html"
          ],
          [
            "GNU echo",
            "https://www.gnu.org/software/coreutils/manual/html_node/echo-invocation.html"
          ],
          [
            "GNU grep",
            "https://www.gnu.org/software/grep/manual/grep.html"
          ],
          [
            "GNU grep exit status",
            "https://www.gnu.org/software/grep/manual/html_node/Exit-Status.html"
          ],
          [
            "GNU find filename patterns",
            "https://www.gnu.org/software/findutils/manual/html_node/find_html/Base-Name-Patterns.html"
          ]
        ]
      },
      {
        "id": "linux-pipes",
        "title": "Connect commands and save their results",
        "lead": "Run in Kali’s Terminal. This drill creates its own word list and colon-separated table. Watch the difference between replacing and appending.",
        "blocks": [
          {
            "label": "Kali Bash · pipes and redirects",
            "code": "mkdir -p \"$HOME/hack4gov-review/linux-basics/pipelines\"\ncd \"$HOME/hack4gov-review/linux-basics/pipelines\" || exit\n\nprintf '%s\\n' 'banana' 'apple' 'banana' 'pear' > \"./words.txt\"\nprintf '%s\\n' 'apple' >> \"./words.txt\"\ncat \"./words.txt\"\n\nLC_ALL=C sort \"./words.txt\" | uniq -c > \"./counts.txt\"\ncat \"./counts.txt\"\nwc -l < \"./words.txt\"\n\nprintf '%s\\n' 'name:score' 'ana:10' 'ben:20' > \"./scores.txt\"\ncut -d ':' -f 1 \"./scores.txt\"",
            "explanation": "words.txt contains five lines: banana, apple, banana, pear, apple. > creates or replaces a file; >> appends. The pipe | sends sort’s output into uniq -c, producing counts of 2 apple, 2 banana, and 1 pear, with leading padding. LC_ALL=C gives sort a predictable character order. wc -l prints 5; cut prints name, ana, and ben."
          }
        ],
        "look": "< feeds a file into a command as standard input. Here wc receives only the contents, so it prints the count without a filename. sort groups equal lines together; uniq counts adjacent duplicates. cut -d ':' -f 1 selects the first colon-delimited field.",
        "pitfalls": [
          "Save processed output to a different filename. A command such as sort file > file can truncate the input before it is read.",
          "uniq detects adjacent repeated lines; unsorted duplicates elsewhere can survive.",
          "wc -l counts newline characters. A final partial line without a newline is not counted.",
          "cut handles simple delimiters; it does not implement quoted CSV parsing."
        ],
        "sources": [
          [
            "Bash pipelines",
            "https://www.gnu.org/software/bash/manual/html_node/Pipelines.html"
          ],
          [
            "Bash redirects",
            "https://www.gnu.org/software/bash/manual/html_node/Redirections.html"
          ],
          [
            "GNU sort",
            "https://www.gnu.org/software/coreutils/manual/html_node/sort-invocation.html"
          ],
          [
            "GNU uniq",
            "https://www.gnu.org/software/coreutils/manual/html_node/uniq-invocation.html"
          ],
          [
            "GNU wc",
            "https://www.gnu.org/software/coreutils/manual/html_node/wc-invocation.html"
          ],
          [
            "GNU cut",
            "https://www.gnu.org/software/coreutils/manual/html_node/cut-invocation.html"
          ]
        ]
      },
      {
        "id": "linux-help-permissions",
        "title": "Check help and understand executable permission",
        "lead": "Run in Kali’s Terminal with Bash. Kali may open another shell by default; type bash first if needed. This drill creates and runs only the short script shown below.",
        "blocks": [
          {
            "label": "Kali Bash · local permission practice",
            "code": "mkdir -p \"$HOME/hack4gov-review/linux-basics/help-permissions\"\ncd \"$HOME/hack4gov-review/linux-basics/help-permissions\" || exit\n\nprintf '%s\\n' '#!/usr/bin/env bash' 'printf \"%s\\n\" \"local practice only\"' > \"./demo.sh\"\nchmod u=rw,go= \"./demo.sh\"\nls -l \"./demo.sh\"\nchmod u+x \"./demo.sh\"\nls -l \"./demo.sh\"\n./demo.sh\nchmod u-x \"./demo.sh\"",
            "explanation": "u means owner, g group, and o others; r means read, w write, and x execute. The first listing starts with -rw-------; adding owner execute changes this to -rwx------. The script prints local practice only. The last command removes owner execute again. Listing metadata such as owner and date varies."
          },
          {
            "label": "Kali Bash · discover commands and help",
            "code": "command -v grep\nhelp cd\ngrep --help\n\n# Optional: run if man and the manual page are installed.\ncommand -v man\nman grep",
            "explanation": "command -v shows what the shell resolves a command to, which can be a path, builtin, function, or alias. help cd explains Bash’s builtin. grep --help summarizes GNU grep options. man grep opens its installed manual when available; press q to quit. If man is missing, use --help and the official links below."
          }
        ],
        "look": "./demo.sh explicitly names a script in the current directory. Read a supplied script before deciding whether to run it in your isolated CTF VM; adding execute permission alone does not establish what its code does.",
        "pitfalls": [
          "help cd is a Bash builtin and may be unavailable in another shell.",
          "A missing command or manual page is a prerequisite issue; do not assume every Kali image includes the same extras.",
          "Use narrow permission changes on your own practice files. Avoid broad chmod 777 changes.",
          "A filesystem mounted with noexec may prevent direct script execution even when x is set."
        ],
        "sources": [
          [
            "Bash builtins and command lookup",
            "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html"
          ],
          [
            "GNU chmod",
            "https://www.gnu.org/software/coreutils/manual/html_node/chmod-invocation.html"
          ],
          [
            "GNU symbolic modes",
            "https://www.gnu.org/software/coreutils/manual/html_node/Symbolic-Modes.html"
          ],
          [
            "man-db documentation system",
            "https://man-db.nongnu.org/"
          ]
        ]
      }
    ]
  }
];
