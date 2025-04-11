import ReCAPTCHA from "react-google-recaptcha";

export default function Captcha({ onChange }) {
  return (
    <ReCAPTCHA
      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
      onChange={onChange}
      // Add these for v2 Checkbox
      theme="light"
      size="normal"
    />
  );
}