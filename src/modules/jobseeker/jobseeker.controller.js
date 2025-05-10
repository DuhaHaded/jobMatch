import fs from 'fs';
import pdfParse from 'pdf-parse';
import path from 'path';

// لاحقاً نضيف LLAMPA و Cosine Similarity

export const analyzeResume = async (req, res) => {
  try {
    const { category } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // مسار الملف
    const filePath = path.join(file.destination, file.filename);
    const fileBuffer = fs.readFileSync(filePath);

    // استخراج النص من ملف PDF
    const pdfData = await pdfParse(fileBuffer);
    const resumeText = pdfData.text;

    // فقط لعرض النتائج حالياً
    res.status(200).json({
      message: 'PDF parsed successfully',
      category,
      resumeText: resumeText.substring(0, 1000) + '...', // عرض أول 1000 حرف فقط
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during resume analysis' });
  }
};
