const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
const header = document.querySelector(".header");
const mobile = window.matchMedia("(max-width: 700px)");

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  navigation.hidden = mobile.matches && !open;
  header.classList.toggle("menu-open", mobile.matches && open);
}
function syncMenu() {
  menuButton.hidden = !mobile.matches;
  setMenu(false);
}
menuButton.addEventListener("click", () =>
  setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
);
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a") && mobile.matches) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    setMenu(false);
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!header.contains(event.target) && mobile.matches) setMenu(false);
});
mobile.addEventListener("change", syncMenu);
syncMenu();

const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        sectionLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    },
    { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
  );
  document
    .querySelectorAll("main section[id]")
    .forEach((section) => observer.observe(section));
}

const copyButton = document.querySelector(".copy-email");
copyButton.hidden = false;
copyButton.addEventListener("click", async () => {
  const status = document.querySelector(".copy-status");
  try {
    await navigator.clipboard.writeText("ambawattaj@gmail.com");
    status.textContent = "Email address copied.";
  } catch {
    status.textContent = "Select the email address above to copy it.";
  }
});
document.querySelector("#year").textContent = new Date().getFullYear();

// Animate on arrival without hiding content when scripts or observers fail.
if ("IntersectionObserver" in window) {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("scroll-enter");
      reveal.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".section-heading, .project, .project-row, .about-copy, .skill, .contact-details")
    .forEach((element) => reveal.observe(element));
}
