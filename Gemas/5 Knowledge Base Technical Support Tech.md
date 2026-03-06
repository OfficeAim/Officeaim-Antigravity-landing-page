# 5 Knowledge Base Technical Support Tech

OFFICEAIM  KNOW  LEDGE  BASE :
TECHNICAL  SUPPORT  TECH
1. THE  STABIL IZATIO N  PROTOCOL  (D E -ESCALATIO N )
Never blame the user. Lower frustration and buy time.
● A c k n o w le d g e  +  C o n fi rm  Im p a c t: "Got it — you can’t log in and it’s blocking your work.
We’ll get you back in."
● S e t a  T ig h t P la n : "I’ll ask 3 quick questions, then we’ll try 2 targeted fixes."
● A v o id  B la m e : Don’t say "you entered the wrong password." Say "we’ll verify credentials
and access path."
● T h e  T ra c k in g  S c rip t: "You won’t need to repeat steps — I’m tracking what we’ve tried."
2 . TRIAGE  CATEGORIE S  (BUCKETIN G  THE  ISSUE )
Always categorize the issue before digging deep:
● A . "In v a lid  u s e rn a m e /p a s s w o rd ": Wrong creds, cached password manager, lockout, or
IdP mismatch.
● B . "A c c o u n t lo c k e d  / T o o  m a n y  a tt e m p ts ": Brute force protection, or background app
stuck in a retry loop.
● C . MFA  P ro b le m s : Time drift on authenticator, push fatigue, SMS delivery failure.
● D . SSO  / O A u th  / SAML  E rro rs : Redirect loops, "app not assigned", cookie issues, clock
skew.
● E . D e v ic e /N e tw o rk  S p e c ifi c : Works for some, not others. Extension interference,
VPN/DNS block, MDM policy.
3 . THE  FAST , H IG H -SUCCESS  CHECKS
Do these before pulling server logs:
1. V e rify  L o c a tio n : Ensure they are using the Enterprise SSO URL, not the consumer login
page.
2. S e s s io n  R e s e t: Private/Incognito window -> attempt login. If it works, clear site
data/cookies.
3. N e tw o rk /P a th : Switch from Wi-Fi to mobile hotspot. Disconnect/Reconnect VPN.
4. M a n u a l E n try : Ask them to type the password manually once (no autofill). Check caps
lock.
4 . DEEP  TROUBLESHOOTIN G  BRANCHES
MFA  F a ilu re s
● TOTP  w ro n g : Confirm phone time is set to "Automatic" (time drift breaks TOTP). Resync
----------------Page (0) Break----------------
code.
● P u s h  n o t s h o w in g : Check battery optimization killing background apps.
● SMS  m is s in g : Verify carrier blocks or country codes.
SSO  / SAML  E rro rs
● "S ta te  m is m a tc h ": Usually a cookie, storage, or aggressive browser extension issue.
● "In v a lid  a u d ie n c e ": Misconfigured app identifiers between IdP and Service Provider.
● "A p p  n o t a s s ig n e d ": Check Group membership in the Identity Provider (Okta, Entra, etc.).
5 . RESOLUTIO N  &  PREVENTIO N
● Don't just verify "logged in". Verify they can perform one key action on the landing page.
● Have the user update saved credentials in their password manager immediately.
● Document the root cause and steps taken for the internal knowledge base.
----------------Page (1) Break----------------
