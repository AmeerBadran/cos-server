const express = require("express");
const Doctor = require("../model/doctor");
const Patient = require("../model/patient");
const Contacting = require("../model/contacting");
const Appointment = require("../model/appointment");
const Medication = require("../model/medication");
const { uploadUserAvatar } = require("../middleware/multerConfig");
const patient = require("../model/patient");

/*
    Insert Data
*/

module.exports.addAppointment = async (req, res) => {
  try {
    const { doctor_id, patient_id, details, date, time } = req.body;

    const FoundDoctor = await Doctor.findOne({ _id: doctor_id });

    if (!FoundDoctor) {
      return res.status(404).json({ message: "No data Found" });
    }

    if (!FoundDoctor.DaysWork || !Array.isArray(FoundDoctor.DaysWork)) {
      return res
        .status(500)
        .json({ message: "Doctor's DaysWork is undefined or invalid" });
    }

    const thePatient = await Patient.findById(patient_id);
    const name = thePatient.first_Name + " " + thePatient.last_Name;
    const appointmentDate = new Date(date);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const appointmentDay = dayNames[appointmentDate.getDay()];

    if (!FoundDoctor.DaysWork.includes(appointmentDay)) {
      return res
        .status(400)
        .json({ message: `Doctor is not available on ${appointmentDay}` });
    }

    const [appointmentHour, appointmentMinute] = time.split(":").map(Number);
    const appointmentTimeInMinutes = appointmentHour * 60 + appointmentMinute;

    const [startHour, startMinute] =
      FoundDoctor.StartTime.split(":").map(Number);
    const [endHour, endMinute] = FoundDoctor.EndTime.split(":").map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    if (
      appointmentTimeInMinutes < startTimeInMinutes ||
      appointmentTimeInMinutes > endTimeInMinutes
    ) {
      return res.status(400).json({
        message: `Appointment time is outside the doctor's working hours`,
      });
    }

    const fifteenMinutes = 14;
    const timeRangeStart = appointmentTimeInMinutes - fifteenMinutes;
    const timeRangeEnd = appointmentTimeInMinutes + fifteenMinutes;

    const existingAppointment = await Appointment.findOne({
      doctor_id,
      date,
      $expr: {
        $and: [
          {
            $gte: [
              {
                $add: [
                  { $multiply: [{ $toInt: { $substr: ["$time", 0, 2] } }, 60] },
                  { $toInt: { $substr: ["$time", 3, 2] } },
                ],
              },
              timeRangeStart,
            ],
          },
          {
            $lte: [
              {
                $add: [
                  { $multiply: [{ $toInt: { $substr: ["$time", 0, 2] } }, 60] },
                  { $toInt: { $substr: ["$time", 3, 2] } },
                ],
              },
              timeRangeEnd,
            ],
          },
        ],
      },
    });

    if (existingAppointment) {
      return res.status(400).json({
        message:
          "There is already an appointment within 15 minutes of the selected time.",
      });
    }

    const newAppointment = new Appointment({
      doctor_id,
      patient_id,
      name,
      email: thePatient.email,
      date: appointmentDate,
      time,
      details,
    });

    await newAppointment.save();
    res.status(200).json({
      message: "Appointment created successfully",
      result: newAppointment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.addVisit = async (req, res) => {
  try {
    const { medicationId, cash, date, note, description } = req.body;

    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({ message: "Medication record not found!" });
    }

    const visitData = {
      cash: cash,
      date: new Date(date),
      note: note,
      description: description,
    };

    medication.visits.push(visitData);

    medication.status = "completed";

    await medication.save();

    res.status(200).json({
      message:
        "Visit added successfully and medication status updated to completed",
      result: medication,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

module.exports.addMedThenDelApp = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const patientData = await Patient.findById(appointment.patient_id);
    if (!patientData) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const existingMedication = await Medication.findOne({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
    });

    if (existingMedication) {
      if (existingMedication.status === "completed") {
        existingMedication.status = "in_progress";
        await existingMedication.save();

        await Appointment.findByIdAndDelete(appointment_id);

        return res.status(200).json({
          message:
            "Medication status updated to in_progress, and appointment deleted.",
          medication: existingMedication,
        });
      } else {
        await Appointment.findByIdAndDelete(appointment_id);
        return res.status(400).json({
          message:
            "You are already registered for medication. Appointment deleted.",
        });
      }
    }

    const newMedication = new Medication({
      doctor_id: appointment.doctor_id,
      patient_id: appointment.patient_id,
      name: `${patientData.first_Name} ${patientData.last_Name}`,
      phone: patientData.phone,
      email: patientData.email,
      status: "in_progress",
    });

    await newMedication.save();

    await Appointment.findByIdAndDelete(appointment_id);

    res.status(200).json({
      message: "Medication added and appointment deleted successfully",
      medication: newMedication,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};

module.exports.addMedication = async (req, res) => {
  try {
    const { doctor_id, patient_id, cash, date, status, note, description } =
      req.body;
    const thePatient = await Patient.findById(patient_id);
    const userData = {
      fullName: thePatient.first_Name + " " + thePatient.last_Name,
      email: thePatient.email,
      phone: thePatient.phone,
    };

    const newMedication = new Medication({
      doctor_id,
      patient_id,
      userData,
      cash,
      date,
      status,
      note,
      description,
    });

    await newMedication.save();
    res
      .status(200)
      .json({ message: "Data inserted successfully", result: newMedication });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
delete data
*/
module.exports.deleteDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    await Doctor.findByIdAndDelete(id);
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.deletePatientById = async (req, res) => {
  try {
    const { id } = req.params;
    await Patient.findByIdAndDelete(id);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.deleteAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    await Appointment.findByIdAndDelete(id);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.deleteVisit = async (req, res) => {
  try {
    const { medicationId, visitId } = req.params;

    const updatedMedication = await Medication.findByIdAndUpdate(
      medicationId,
      { $pull: { visits: { _id: visitId } } },
      { new: true }
    );

    if (!updatedMedication) {
      return res.status(404).json({ message: "Medication record not found" });
    }

    res.status(200).json({
      message: "Visit deleted successfully",
      result: updatedMedication,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.deleteContactById = async (req, res) => {
  try {
    const { id } = req.params;
    await Contacting.findByIdAndDelete(id);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
    Update Data
*/
module.exports.updateDoctorById = async (req, res) => {
  uploadUserAvatar(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { id } = req.body;
      let updateData = req.body;

      if (req.file) {
        updateData.avatar = req.file.filename;
      }

      const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      res
        .status(200)
        .json({ message: "Data updated successfully", result: updatedDoctor });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
};

module.exports.updateVisit = async (req, res) => {
  try {
    const { medicationId, visitId, updatedData } = req.body;

    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({ message: "Medication record not found" });
    }

    const visit = medication.visits.find(
      (visit) => visit.id.toString() === visitId
    );
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    Object.assign(visit, updatedData);
    await medication.save();

    res.status(200).json({
      message: "Visit updated successfully",
      result: medication,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.updatePatientById = async (req, res) => {
  try {
    const { id } = req.body;
    let updateData = req.body;

    const updatedPatient = await Patient.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedPatient) {
      return res.status(404).json({ message: "No data Found" });
    }

    res
      .status(200)
      .json({ message: "Data updated successfully", result: updatedPatient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.updateMedication = async (req, res) => {
  try {
    const { id, cash, status, date, note, description } = req.body;

    console.log(req.body);

    const updateOperation = {};

    if (cash !== undefined) {
      updateOperation.cash = cash;
    }

    if (status !== undefined) {
      updateOperation.status = status;
    }

    if (date) {
      updateOperation.$push = { ...updateOperation.$push, date: date };
    }

    if (description) {
      updateOperation.$push = {
        ...updateOperation.$push,
        description: description,
      };
    }

    if (note) {
      updateOperation.$push = { ...updateOperation.$push, note: note };
    }

    const updatedMedication = await Medication.findByIdAndUpdate(
      id,
      updateOperation,
      {
        new: true,
      }
    );

    if (!updatedMedication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    res.status(200).json({
      message: "Data updated successfully",
      result: updatedMedication,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
Get Data:
*/

module.exports.getDoctors = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 8;
    const skip = (page - 1) * limit;
    const doctors = await Doctor.find({ role: "doctor" })
      .skip(skip)
      .limit(limit);

    if (doctors && doctors.length > 0) {
      return res.status(200).json(doctors);
    } else {
      return res.status(404).json({ message: "No data Found" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};

module.exports.getAppointment = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 6;
    const doctor_id = req.params.doctor_id;
    const skip = (page - 1) * limit;
    const appointments = await Appointment.find({ doctor_id: doctor_id })
      .skip(skip)
      .limit(limit);

    if (appointments && appointments.length > 0) {
      return res.status(200).json(appointments);
    } else {
      return res.status(404).json({ message: "No data Found" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};

module.exports.getPatients = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 4;
    const skip = (page - 1) * limit;
    const patients = await Patient.find().skip(skip).limit(limit);

    if (patients && patients.length > 0) {
      return res.status(200).json(patients);
    } else {
      return res.status(404).json({ message: "No data Found" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};

module.exports.searchDoctor = async (req, res) => {
  try {
    const { city, specialty } = req.body;
    console.log(req.body);
    const query = {};
    if (city) query.city = city;
    if (specialty) query.specialization = specialty;

    const found = await Doctor.find(query);

    if (found.role === "admin") {
      return res.status(404).json({ message: "No data found" });
    }

    console.log(found);

    if (!found || found.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    res.status(200).json(found);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};

module.exports.CitiesAndSpecializations = async (req, res) => {
  try {
    const data = await Doctor.aggregate([
      {
        $group: {
          _id: null,
          cities: { $addToSet: "$city" },
          specializations: { $addToSet: "$specialization" },
        },
      },
      {
        $project: {
          _id: 0,
          cities: 1,
          specializations: 1,
        },
      },
    ]);

    if (!data.length) {
      return res.status(404).json({ message: "No data found" });
    }

    const { cities, specializations } = data[0];

    res.status(200).json({ cities, specializations });
  } catch (err) {
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};

module.exports.getContacts = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 6;
    const skip = (page - 1) * limit;
    const contacts = await Contacting.find().skip(skip).limit(limit);

    if (contacts && contacts.length > 0) {
      return res.status(200).json(contacts);
    } else {
      return res.status(404).json({ message: "No data Found" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};

module.exports.getMedication = async (req, res) => {
  try {
    const { doctor_id, val } = req.params;

    const foundDoctor = await Doctor.findById(doctor_id);
    if (!foundDoctor) {
      return res.status(404).json({ message: "No doctor found" });
    }

    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 6;
    const skip = (page - 1) * limit;

    const query = { doctor_id };
    if (val && val !== "empty") {
      query.status = val;
    }

    const medications = await Medication.find(query)
      .populate("doctor_id", "name")
      .populate("patient_id", "name")
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    if (!medications || medications.length === 0) {
      return res.status(404).json({
        message: `No medications found for this doctor${
          val && val !== "empty" ? ` with status ${val}` : ""
        }`,
        data: [],
      });
    }

    const formattedMedications = medications.map((med) => ({
      ...med._doc,
    }));

    const totalMedications = await Medication.countDocuments(query);
    const totalPages = Math.ceil(totalMedications / limit);

    res.status(200).json({
      message: "Medications retrieved successfully",
      data: formattedMedications,
      pagination: {
        totalRecords: totalMedications,
        totalPages: totalPages,
        currentPage: page,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Count Functions:

module.exports.countDoctor = async (req, res) => {
  try {
    const doctorCount = await Doctor.countDocuments({ role: "doctor" });
    return res.status(200).json({ count: doctorCount });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + err.message });
  }
};

module.exports.countAppointments = async (req, res) => {
  try {
    const appointmentCount = await Appointment.countDocuments();
    if (appointmentCount === 0) {
      return res.status(404).json({ message: "No data Found" });
    }
    return res.status(200).json({ count: appointmentCount });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + err.message });
  }
};

module.exports.countPatients = async (req, res) => {
  try {
    const patientCount = await Patient.countDocuments();
    if (patientCount === 0) {
      return res.status(404).json({ message: "No data Found" });
    }
    return res.status(200).json({ count: patientCount });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + err.message });
  }
};

module.exports.countMedications = async (req, res) => {
  try {
    const doctor_id = req.params.doctor_id;
    const medicationCount = await Medication.countDocuments({
      doctor_id: doctor_id,
    });
    if (medicationCount === 0) {
      return res.status(404).json({ message: "No data Found" });
    }
    return res.status(200).json({ count: medicationCount });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + err.message });
  }
};

module.exports.countPendingMedications = async (req, res) => {
  try {
    const { doctor_id, val } = req.params;

    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 6;
    const skip = (page - 1) * limit;

    const query = { doctor_id: doctor_id };
    if (val === "pending") {
      query.status = "pending";
    }

    const totalMedications = await Medication.countDocuments(query);

    if (totalMedications === 0) {
      return res.status(404).json({ message: "No medications found" });
    }

    const medications = await Medication.find(query).skip(skip).limit(limit);

    const totalPages = Math.ceil(totalMedications / limit);

    return res.status(200).json({
      message: "Medications retrieved successfully",
      data: medications,
      pagination: {
        totalRecords: totalMedications,
        totalPages: totalPages,
        currentPage: page,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + err.message });
  }
};

module.exports.countAppForDoctors = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const appointmentCount = await Appointment.countDocuments({ doctor_id });
    if (appointmentCount === 0) {
      return res
        .status(404)
        .json({ message: "No appointments found for this doctor" });
    }
    return res.status(200).json({ count: appointmentCount });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + err.message });
  }
};

module.exports.countMedForDoctors = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const medicationCount = await Medication.countDocuments({ doctor_id });

    if (medicationCount === 0) {
      return res
        .status(404)
        .json({ message: "No medications found for this doctor" });
    }

    return res.status(200).json({ count: medicationCount });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error: " + err.message });
  }
};

module.exports.getPatientAppointment = async (req, res) => {
  try {
    const { patient_id } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find({ patient_id })
      .populate("doctor_id", "name specialty")
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    if (!appointments || appointments.length === 0) {
      return res
        .status(404)
        .json({ message: "No appointments found for this patient" });
    }

    const totalAppointments = await Appointment.countDocuments({ patient_id });
    const totalPages = Math.ceil(totalAppointments / limit);

    res.status(200).json({
      message: "Appointments retrieved successfully",
      data: appointments,
      pagination: {
        totalRecords: totalAppointments,
        totalPages: totalPages,
        currentPage: page,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports.getPatientMedications = async (req, res) => {
  try {
    const { patient_id } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const medications = await Medication.find({ patient_id })
      .populate("doctor_id", "name specialty")
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    if (!medications || medications.length === 0) {
      return res
        .status(404)
        .json({ message: "No medications found for this patient" });
    }

    const totalMedications = await Medication.countDocuments({ patient_id });
    const totalPages = Math.ceil(totalMedications / limit);

    res.status(200).json({
      message: "Medications retrieved successfully",
      data: medications,
      pagination: {
        totalRecords: totalMedications,
        totalPages: totalPages,
        currentPage: page,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports.deletePatientAppointments = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    if (!appointment_id) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    const result = await Appointment.findByIdAndDelete(appointment_id);

    if (!result) {
      return res
        .status(404)
        .json({ message: "No appointment found with the given ID" });
    }

    res.status(200).json({
      message: "Appointment deleted successfully",
      deletedAppointment: result,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports.upgradePatientToAdmin = async (req, res) => {
  try {
    
  } catch (err) {
    res.status(500).json({message: "Internal Server Error" + err.message});
  }
}