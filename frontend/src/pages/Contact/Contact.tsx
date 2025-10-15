import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useState, useRef } from "react";
import ButtonComponent from "../../components/Button/Button";
import { userService } from "../../services/userService";
import { validationService } from "../../validation/validationService";
import { validationErrorService } from "../../validation/validationErrorService";
import { useNotifications } from "../../services/notificationContext";
import { useTranslation } from "react-i18next";

function Contact() {
  const { success, error } = useNotifications();

  const [form, setForm] = useState({ title: "", description: "", phone: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSending, setIsSending] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });

    // Validate required fields
    if (field === "title" || field === "description") {
      const errorObj = validationService.requiredValidator(value, field === "title" ? "Title" : "Description");
      setErrors((prev) => ({
        ...prev,
        [field]: validationErrorService.getErrorMessage(errorObj),
      }));
    }
  };

  const formIsValid = form.title && form.description && !errors.title && !errors.description;

  const handleSubmit = async () => {
    if (!formIsValid) return;

    setIsSending(true);
    setErrors({});
    try {
      await userService.contact(form);
      success(t("Message sent successfully!"));
      setForm({ title: "", description: "", phone: "" });
    } catch (err: any) {
      console.error("Error sending message:", err);
      error("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="text-center page lg:mx-10 h-screen w-screen">
      <div className="flex justify-center items-start h-full">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md h-3/6 flex flex-col justify-between h-auto">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">{t("Contact Us")}</h2>

          <div className="py-5 flex items-center flex-col justify-between w-11/12 space-y-4 h-full w-full gap-2">
            <TextField
              label={t("Title")}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              fullWidth
              variant="outlined"
              error={!!errors.title}
              helperText={errors.title}
              inputRef={titleRef}
            />

            <TextField
              label={t("Description")}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description}
              inputRef={descriptionRef}
            />

            <TextField
              label={t("Phone (optional)")}
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              fullWidth
              variant="outlined"
              inputRef={phoneRef}
            />
          </div>

          <ButtonComponent
            buttonText={isSending ? t("Sending..."): t("Send")}
            onClick={handleSubmit}
            disabled={!formIsValid || isSending}
          />
        </div>
      </div>
    </div>
  );
}

export default Contact;
