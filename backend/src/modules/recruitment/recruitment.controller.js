const Job = require('./job.model');
const Candidate = require('./candidate.model');

// --- Jobs API ---
exports.createJob = async (req, res) => {
    try {
        const job = new Job({ ...req.body, postedBy: req.user.id });
        await job.save();
        res.status(201).json({ message: 'Job posted successfully', job });
    } catch (error) {
        res.status(500).json({ message: 'Error posting job', error: error.message });
    }
};

exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        
        // Add candidate counts to each job
        const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
            const applicantsCount = await Candidate.countDocuments({ jobId: job._id });
            return { ...job.toObject(), applicantsCount };
        }));

        res.status(200).json(jobsWithCounts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
};

exports.updateJobStatus = async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status },
            { new: true }
        );
        res.status(200).json({ message: 'Job status updated', job });
    } catch (error) {
        res.status(500).json({ message: 'Error updating job', error: error.message });
    }
};

// --- Candidates API ---
exports.createCandidate = async (req, res) => {
    try {
        const candidate = new Candidate(req.body);
        await candidate.save();
        res.status(201).json({ message: 'Candidate added successfully', candidate });
    } catch (error) {
        res.status(500).json({ message: 'Error adding candidate', error: error.message });
    }
};

exports.getCandidatesByJob = async (req, res) => {
    try {
        const candidates = await Candidate.find({ jobId: req.params.jobId }).sort({ createdAt: -1 });
        res.status(200).json(candidates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching candidates', error: error.message });
    }
};

exports.updateCandidateStage = async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id, 
            { stage: req.body.stage },
            { new: true }
        );
        res.status(200).json({ message: 'Candidate stage updated', candidate });
    } catch (error) {
        res.status(500).json({ message: 'Error updating candidate', error: error.message });
    }
};
