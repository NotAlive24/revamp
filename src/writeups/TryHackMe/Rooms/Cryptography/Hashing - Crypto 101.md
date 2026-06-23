**Plaintext** - Data before encryption or hashing, often text but not always as it could be a photograph or other files.
**Encoding** - This is NOT a form of encryption, just a form of data representation like base64 or hexadecimal. Immediately reversible (like translation, can be translated back).
**Hash** - A hash is the output of a hash function. Hashing can also be used as a verb, "to hash", meaning to produce the hash value of some data.
**Brute force** - Attacking cryptography by trying every different password or every different key
**Cryptanalysis** - Attacking cryptography by finding a weakness in the underlying maths


## Hashing
A hash function is a process that takes input data of any size and produces a fixed-size output called a digest. Unlike encryption, it does not use a key and is designed to be one-way, meaning it should be extremely difficult to reconstruct the original input from the output.

Good hash functions are fast to compute but hard to reverse. They also have a property called the avalanche effect, where even a tiny change in the input (like a single bit) causes a significant change in the output, making the results unpredictable.

The output of a hash function is usually raw binary data, which is then encoded into readable formats like hexadecimal or base64. Decoding this output does not reveal the original input, as the process is not reversible.

Hashing is widely used in cybersecurity, especially for protecting passwords. Instead of storing your actual password, systems store its hash, which is a fixed-length representation of the password.

When you log in (for example, to TryHackMe or your computer), the system hashes the password you enter and compares it to the stored hash. If both hashes match, you are authenticated without ever exposing the real password.

This means you interact with hashing frequently without noticing it, as it works behind the scenes to securely verify your identity while keeping sensitive data protected.

A **hash collision** happens when two completely different inputs produce the same hash output. Since hash functions are designed to create unique digests for data, collisions are undesirable and strong algorithms aim to make them extremely rare, especially preventing attackers from intentionally creating them (called engineered collisions).

However, collisions are **mathematically unavoidable** because of the **pigeonhole principle**. A hash function has a fixed number of possible outputs (for example, a 128-bit hash has a limited number of combinations), but it can accept inputs of any size and quantity. This means there are more possible inputs than outputs, so at least some different inputs must end up producing the same hash. It’s like trying to fit more pigeons than pigeonholes, some will inevitably share a space.

Older hash algorithms like **MD5** and **SHA-1** have been proven insecure because researchers have successfully created intentional collisions. This makes them unsuitable for security-sensitive uses like password storage or digital signatures. However, no known attack has produced the same collision in both MD5 and SHA-1 simultaneously, so combining both hashes can still help detect differences between inputs, though modern secure algorithms like SHA-256 are preferred.

Hashing is mainly used in cybersecurity for **password verification** and **data integrity checking**. For passwords, instead of storing the actual password (plaintext), systems store the hash of the password. When a user logs in, the entered password is hashed and compared with the stored hash. This way, even if a database is leaked, attackers don’t immediately get the real passwords—they would still need to crack each hash.

Storing plaintext passwords is extremely dangerous, as seen in real-world breaches like the **rockyou.txt** leak, where millions of passwords were exposed. Encryption isn’t ideal either for passwords because the decryption key must be stored somewhere, and if that key is compromised, all passwords can be revealed. Hashing solves this by being one-way, meaning the original password cannot be easily retrieved from the hash.

However, hashing alone has weaknesses. If two users have the same password, they will have the same hash, making it easier for attackers to compromise multiple accounts at once. Attackers can also use **rainbow tables**, which are precomputed lists of hashes and their corresponding plaintext passwords, to quickly crack hashes. This is why modern systems improve hashing with techniques like salting (adding randomness) to make attacks much harder.

Websites like CrackStation use massive **rainbow tables** to quickly crack hashes that don’t use salts. Instead of computing hashes repeatedly, they simply look up the hash in a precomputed list, which is much faster than brute-force cracking.

To defend against this, systems use a **salt**, which is a random value added to each password before hashing. This salt is unique per user and stored alongside the hash. By adding the salt (either at the beginning or end of the password), even identical passwords will produce completely different hashes, making rainbow tables ineffective.

Modern hashing algorithms like **bcrypt** and **sha512crypt** automatically handle salting. Importantly, salts do not need to be kept secret, their purpose is to ensure uniqueness and prevent attackers from using precomputed tables to crack multiple passwords efficiently.

Automated hash recognition tools like hashID can help identify hash types, but they are not always reliable especially for similar-looking hashes like MD5, NTLM, or MD4. Tools work best when hashes include a clear prefix, but in many cases, you must rely on **context** (e.g., where the hash came from) along with tools. For example, a hash from a web app database is more likely MD5 than NTLM.

Some hash formats are easier to recognize. **Unix-style password hashes** include prefixes that indicate the algorithm used, following a format like `$format$rounds$salt$hash`. For instance, `$1$` means MD5, `$2$` variants indicate bcrypt, and `$6$` represents SHA-512. These prefixes make identification straightforward compared to other hash types.

On systems, password hashes are stored securely: on Linux in `/etc/shadow` (restricted to root), and on Windows in the **SAM (Security Account Manager)** database. Windows hashes are typically NTLM-based and look similar to MD4/MD5, so identification depends heavily on context. Overall, recognizing hash types often requires combining tools, pattern recognition (like prefixes or length), and research into how the hash was generated.

## Cracking

When a hash includes a **salt**, rainbow tables become ineffective because each password is combined with a unique random value before hashing. This means attackers can no longer rely on precomputed tables, they must instead **crack each hash individually** by trying many possible passwords, adding the salt each time, and comparing the result to the target hash.

Since hashes cannot be decrypted, cracking involves **brute-force or dictionary attacks** using tools like **Hashcat** or **John the Ripper**. These tools take wordlists (like _rockyou.txt_), apply hashing (with salts if needed), and check for matches. This process can be very time-consuming, depending on the hash type and password strength.

GPUs are preferred for cracking because they have thousands of cores and can perform hashing operations much faster than CPUs. However, some algorithms like **bcrypt** are designed to resist GPU acceleration, making them slower to crack. Also, cracking inside virtual machines is usually less efficient since they often lack full GPU access, running tools on the host system gives much better performance.

Hashing is commonly used for **integrity checking**, ensuring that data has not been altered. Since the same input always produces the same hash, even a tiny change in the data will result in a completely different hash. This makes it useful for verifying file downloads, detecting tampering, or identifying duplicate files—if two files have the same hash, they are identical.

Another important use is **HMAC (Hash-based Message Authentication Code)**, which combines a hash function with a secret key. Unlike normal hashing, HMAC ensures both **integrity** (data hasn’t changed) and **authenticity** (it came from a trusted source). Only someone with the secret key can generate the correct HMAC.

For example, systems like VPNs use algorithms such as **HMAC-SHA512** to verify secure communication. This ensures that messages are not modified during transmission and that they are sent by a legitimate source, adding an extra layer of security beyond basic hashing.