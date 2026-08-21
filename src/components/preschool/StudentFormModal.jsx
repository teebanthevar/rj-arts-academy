import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "../../styles/StudentFormModal.css";

export default function StudentFormModal({
  preschoolId,
  student,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    parentName: "",
    parentContact: "",
    country: "",
    state: "",
    city: "",
    specialStatus: "None",
    specialStatusDetails: "",
    message: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);

  // =========================================================
  // LOAD STUDENT + ORIGINAL ENROLLMENT DATA
  // =========================================================

  useEffect(() => {
    loadStudentData();
  }, [student, preschoolId]);

  async function loadStudentData() {
    /*
      ADD STUDENT
      If there is no existing student, start with empty fields.
    */
    if (!student) {
      setForm({
        fullName: "",
        age: "",
        parentName: "",
        parentContact: "",
        country: "",
        state: "",
        city: "",
        specialStatus: "None",
        specialStatusDetails: "",
        message: "",
      });

      setPreview(null);
      setPhotoFile(null);
      return;
    }

    setLoadingEnrollment(true);

    /*
      Start with whatever is already inside preschool_students.
      This gives us a fallback if an enrollment cannot be found.
    */
    let studentData = {
      fullName: student?.full_name || "",
      age:
        student?.age !== null && student?.age !== undefined
          ? String(student.age)
          : "",
      parentName: student?.parent_name || "",
      parentContact: student?.parent_phone || "",
      country: student?.country || "",
      state: student?.state || "",
      city: student?.city || "",
      specialStatus: student?.special_status || "None",
      specialStatusDetails: student?.special_status_details || "",
      message: student?.message || "",
    };

    let enrollment = null;

    try {
      /*
        Get all enrollment records for this preschool.

        We then find the enrollment that belongs to this student.
        Matching priority:
        1. Child name + parent contact
        2. Child name + parent name
        3. Child name
      */

      const { data: enrollments, error } = await supabase
        .from("preschool_enrollments")
        .select("*")
        .eq("preschool_id", preschoolId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Unable to load original enrollment:",
          error
        );
      } else if (enrollments?.length) {
        const studentName = (
          student.full_name || ""
        )
          .trim()
          .toLowerCase();

        const studentParentName = (
          student.parent_name || ""
        )
          .trim()
          .toLowerCase();

        const studentPhone = (
          student.parent_phone || ""
        )
          .replace(/\D/g, "");

        /*
          1. Best match:
          Child name + parent contact
        */
        enrollment = enrollments.find((item) => {
          const enrollmentName = (
            item.child_name ||
            item.full_name ||
            ""
          )
            .trim()
            .toLowerCase();

          const enrollmentPhone = (
            item.parent_contact ||
            item.parent_phone ||
            ""
          ).replace(/\D/g, "");

          return (
            enrollmentName === studentName &&
            studentPhone &&
            enrollmentPhone &&
            enrollmentPhone === studentPhone
          );
        });

        /*
          2. Second match:
          Child name + parent name
        */
        if (!enrollment) {
          enrollment = enrollments.find((item) => {
            const enrollmentName = (
              item.child_name ||
              item.full_name ||
              ""
            )
              .trim()
              .toLowerCase();

            const enrollmentParentName = (
              item.parent_name || ""
            )
              .trim()
              .toLowerCase();

            return (
              enrollmentName === studentName &&
              studentParentName &&
              enrollmentParentName &&
              enrollmentParentName === studentParentName
            );
          });
        }

        /*
          3. Final fallback:
          Child name
        */
        if (!enrollment) {
          enrollment = enrollments.find((item) => {
            const enrollmentName = (
              item.child_name ||
              item.full_name ||
              ""
            )
              .trim()
              .toLowerCase();

            return (
              enrollmentName === studentName
            );
          });
        }
      }

      /*
        If the original enrollment was found,
        use its values to populate the modal.

        IMPORTANT:
        The enrollment form uses:
          child_name
          child_age
          parent_name
          parent_contact
          country
          state
          city
          special_status
          special_status_details
          message
      */

      if (enrollment) {
        studentData = {
          fullName:
            enrollment.child_name ||
            enrollment.full_name ||
            studentData.fullName,

          age:
            enrollment.child_age !== null &&
            enrollment.child_age !== undefined
              ? String(enrollment.child_age)
              : studentData.age,

          parentName:
            enrollment.parent_name ||
            studentData.parentName,

          parentContact:
            enrollment.parent_contact ||
            enrollment.parent_phone ||
            studentData.parentContact,

          country:
            enrollment.country ||
            studentData.country,

          state:
            enrollment.state ||
            studentData.state,

          city:
            enrollment.city ||
            studentData.city,

          specialStatus:
            enrollment.special_status ||
            studentData.specialStatus ||
            "None",

          specialStatusDetails:
            enrollment.special_status_details ||
            studentData.specialStatusDetails,

          message:
            enrollment.message ||
            studentData.message,
        };
      }
    } catch (error) {
      console.error(
        "Error loading enrollment data:",
        error
      );
    } finally {
      setLoadingEnrollment(false);
    }

    /*
      Set the final form values.
    */
    setForm(studentData);

    /*
      Photo comes from the student record.
      Enrollment photo is used as fallback.
    */
    setPreview(
      student?.photo_url ||
        enrollment?.photo_url ||
        null
    );

    setPhotoFile(null);
  }

  // =========================================================
  // FORM UPDATE
  // =========================================================

  function update(field) {
    return (e) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };
  }

  // =========================================================
  // PHOTO
  // =========================================================

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  // =========================================================
  // SAVE
  // =========================================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.fullName.trim()) {
      alert("Please enter the child's name.");
      return;
    }

    setSaving(true);

    try {
      let photoUrl = student?.photo_url || null;

      // =====================================================
      // UPLOAD NEW PHOTO
      // =====================================================

      if (photoFile) {
        const safeFileName = photoFile.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

        const filePath = `${preschoolId}/${Date.now()}-${safeFileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("student-photos")
            .upload(
              filePath,
              photoFile,
              {
                upsert: true,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        const { data } =
          supabase.storage
            .from("student-photos")
            .getPublicUrl(filePath);

        photoUrl = data?.publicUrl || photoUrl;
      }

      // =====================================================
      // STUDENT DATA
      // =====================================================

      const payload = {
        preschool_id: preschoolId,

        full_name: form.fullName.trim(),

        age: form.age.trim(),

        parent_name:
          form.parentName.trim(),

        parent_phone:
          form.parentContact.trim(),

        country:
          form.country.trim(),

        state:
          form.state.trim(),

        city:
          form.city.trim(),

        special_status:
          form.specialStatus || "None",

        special_status_details:
          form.specialStatus !== "None"
            ? form.specialStatusDetails.trim()
            : "",

        message:
          form.message.trim(),

        photo_url: photoUrl,
      };

      // =====================================================
      // UPDATE EXISTING STUDENT
      // =====================================================

      if (student) {
        const { error } =
          await supabase
            .from("preschool_students")
            .update(payload)
            .eq("id", student.id);

        if (error) {
          throw error;
        }
      }

      // =====================================================
      // CREATE NEW STUDENT
      // =====================================================

      else {
        const { error } =
          await supabase
            .from("preschool_students")
            .insert(payload);

        if (error) {
          throw error;
        }
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      onSaved();
      onClose();
    } catch (error) {
      console.error(
        "Student save error:",
        error
      );

      alert(
        error?.message ||
          "Unable to save student."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <h3>
          {student
            ? "Edit Student"
            : "Add Student"}
        </h3>

        {loadingEnrollment && student && (
          <div
            style={{
              fontSize: "13px",
              marginBottom: "12px",
              opacity: 0.7,
            }}
          >
            Loading enrollment information...
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="student-form"
        >
          {/* PHOTO */}

          <label className="photo-upload">
            {preview ? (
              <img
                src={preview}
                alt="Student"
              />
            ) : (
              <span>Add Photo</span>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              hidden
            />
          </label>

          <div className="form-grid">

            {/* CHILD */}

            <input
              placeholder="Child's Name"
              value={form.fullName}
              onChange={update("fullName")}
              required
            />

            <input
              placeholder="Child's Age (e.g. 4 years old)"
              value={form.age}
              onChange={update("age")}
            />

            {/* PARENT */}

            <input
              placeholder="Parent's Name"
              value={form.parentName}
              onChange={update("parentName")}
            />

            <input
              placeholder="Contact Number"
              value={form.parentContact}
              onChange={update("parentContact")}
            />

            {/* LOCATION */}

            <input
              placeholder="Country"
              value={form.country}
              onChange={update("country")}
            />

            <input
              placeholder="State"
              value={form.state}
              onChange={update("state")}
            />

            <input
              placeholder="City"
              value={form.city}
              onChange={update("city")}
              className="span-2"
            />

            {/* SPECIAL STATUS */}

            <select
              value={form.specialStatus}
              onChange={update("specialStatus")}
              className={
                form.specialStatus === "None"
                  ? "span-2"
                  : ""
              }
            >
              <option value="None">
                Special Student Status: None
              </option>

              <option value="Special Needs">
                Special Needs
              </option>

              <option value="Allergies">
                Allergies
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            {form.specialStatus !== "None" && (
              <textarea
                placeholder="Special status details"
                value={
                  form.specialStatusDetails
                }
                onChange={update(
                  "specialStatusDetails"
                )}
                className="span-2"
                rows={2}
              />
            )}

            {/* MESSAGE */}

            <textarea
              placeholder="Message (optional)"
              value={form.message}
              onChange={update("message")}
              className="span-2"
              rows={3}
            />
          </div>

          {/* ACTIONS */}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={
                saving ||
                loadingEnrollment
              }
            >
              {saving
                ? "Saving…"
                : "Save Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}