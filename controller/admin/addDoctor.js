const { uploadUserAvatar } = require("../../middleware/multerConfig");
const Doctor = require('../../model/doctor');

const createDoctor = async (req, res) => {
  uploadUserAvatar(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "avatar errooor"});
    }
    
    try {
      
      const {
        first_Name,
        last_Name,
        country,
        city,
        role,
        birthdate,
        qualification,
        experience,
        specialization,
        description,
        phone,
        gender,
        StartTime,
        EndTime,
        DaysWork,
        email,
        password,
      } = req.body;

      if (!isEmailStartsWithDr(email)) {
        return res.status(400).json({
          message: "Email is not valid; email for doctor must be like dr.doctorname@example.com",
        });
      }
      
      const doctorData = new Doctor({
        first_Name,
        last_Name,
        country,
        city,
        avatar: req.file ? req.file.filename : null,
        role,
        birthdate,
        qualification,
        experience,
        specialization,
        description,
        gender,
        StartTime,
        EndTime,
        DaysWork,
        phone,
        email,
        password,
      });

      await doctorData.save();

      res.status(201).json({ message: "Doctor created successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server Error" + err.message });
    }
  });
};

function isEmailStartsWithDr(email) {
  const regex = /^dr\./i;
  return regex.test(email);
}

module.exports = createDoctor;
