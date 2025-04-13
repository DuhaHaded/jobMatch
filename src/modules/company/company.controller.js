import JobModel from  '../../../db/model/job.model.js';
 // استدعاء موديل الوظائف

export const getPostedJobs = async (req, res) => {
  try {
    const companyId = req.user._id; // جلب ID الشركة من التوكن
    const jobs = await JobModel.find({ company: companyId }); // جلب الوظائف التابعة لها

    res.json({ message: "Success", jobs }); // إرسال الوظائف للفرونت
  } catch (error) {
    res.status(500).json({ message: "Failed", error }); // في حال حصل خطأ
  }
};
