document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("form");
if (form) {
  const phone = form.querySelector('[name="phone-number"]');
  const website = form.querySelector('[name="company-website"], [name="website-adress"]');
  const email = form.querySelector('[name="email"]');
  const submitBtn = form.querySelector('[type="submit"]');

  // Disable submit on init — Webflow resets the `disabled` attr after load,
  // so we use a CSS class instead to avoid that conflict
  submitBtn.classList.add("is-disabled");

  const validators = {
    // Strip non-digits and check length — permissive enough for all international formats
    phone: (v) => v.replace(/\D/g, "").length >= 7,
    website: (v) => {
      let val = v.trim();
      // Auto-prepend protocol so user can type "example.com" without https://
      if (!/^https?:\/\//i.test(val)) val = "https://" + val;
      try {
        // Native URL constructor does the heavy lifting — throws if invalid
        const url = new URL(val);
        return url.hostname.includes(".");
      } catch {
        return false;
      }
    },
    // Checks for @ symbol, domain and TLD
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  };

  function shakeField(input) {
    gsap.fromTo(
      input,
      { x: -6 },
      { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" },
    );
  }

  function setFieldError(input, hasError) {
    gsap.to(input, {
      borderColor: hasError ? "#ff2d2d" : "",
      duration: 0.2,
      ease: "power2.out",
    });
    if (hasError) shakeField(input);
  }

  function bindField(input, validateFn) {
    // Validate on blur only if field has a value — avoids errors on empty untouched fields
    input.addEventListener("blur", () => {
      if (input.value) setFieldError(input, !validateFn(input.value));
    });
    // Re-validate on each keystroke only if field already has an error state
    input.addEventListener("input", () => {
      if (input.style.borderColor) {
        setFieldError(input, !validateFn(input.value));
      }
    });
  }

  function checkAllFilled() {
    // Exclude submit button itself — it has a value attr that would count as filled
    const inputs = [
      ...form.querySelectorAll('input:not([type="submit"]), textarea, select'),
    ];
    const allFilled = inputs.every((input) => input.value.trim() !== "");
    submitBtn.classList.toggle("is-disabled", !allFilled);
  }

  bindField(phone, validators.phone);
  // Prevent non-phone characters from being typed
  phone.addEventListener("input", () => {
    phone.value = phone.value.replace(/[^\d\s\+\-().]/g, "");
  });

  if (website) bindField(website, validators.website);
  bindField(email, validators.email);

  checkAllFilled();
  form.addEventListener("input", checkAllFilled);

  form.addEventListener("submit", (e) => {
    // Block submit via class check — native `disabled` attr is not used (see top comment)
    if (submitBtn.classList.contains("is-disabled")) {
      e.preventDefault();
      return;
    }

    const phoneOk = validators.phone(phone.value);
    const websiteOk = website ? validators.website(website.value) : true;
    const emailOk = validators.email(email.value);
    setFieldError(phone, !phoneOk);
    if (website) setFieldError(website, !websiteOk);
    setFieldError(email, !emailOk);
    if (!phoneOk || !websiteOk || !emailOk) e.preventDefault();
  });
}
});
