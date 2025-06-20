chrome.storage.local.get(["blockedSites"], (result) => {
  const entries = result.blockedSites || [];
  const now = Date.now();

  const currentUrl = window.location.href;
  const bgImage = chrome.runtime.getURL("blocked-bg.jpg");
  const isBlocked = entries.some(entry => {
    return currentUrl.includes(entry.site) && entry.expiresAt > now;
  });

  if (isBlocked) {
    document.body.innerHTML = `
  <div style="
    height: 100vh;
    width: 100vw;
    background-image: url('${bgImage}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    margin: 0;
    padding: 0;
  ">
  </div>
`;

    document.body.style.margin = "0";
    document.documentElement.style.margin = "0";
    document.body.style.overflow = "hidden";
  }
});
