import { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    TextField,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// Import images correctly
import admissionsBanner from '../assets/images/benson.jpg';
// import admissionProcess from '../assets/images/admission-process.jpg';

function Admissions() {
    const [applications, setApplications] = useState([]);
    const { user } = useAuth();

    const validationSchema = yup.object({
        childName: yup.string().required('Child\'s name is required'),
        childAge: yup.number().required('Child\'s age is required'),
        childGender: yup.string().required('Child\'s gender is required'),
        childDOB: yup.date().required('Date of birth is required'),
        parentName: yup.string().required('Parent\'s name is required'),
        parentEmail: yup.string().email('Enter a valid email').required('Email is required'),
        parentPhone: yup.string().required('Phone number is required'),
        address: yup.string().required('Address is required'),
        classApplied: yup.string().required('Class is required')
    });

    const formik = useFormik({
        initialValues: {
            childName: '',
            childAge: '',
            childGender: '',
            childDOB: '',
            parentName: '',
            parentEmail: '',
            parentPhone: '',
            address: '',
            classApplied: '',
            additionalInfo: '',
            documents: []
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                const formData = new FormData();
                
                Object.keys(values).forEach(key => {
                    if (key !== 'documents') {
                        formData.append(key, values[key]);
                    }
                });
                
                if (values.documents) {
                    Array.from(values.documents).forEach(file => {
                        formData.append('documents', file);
                    });
                }

                await axios.post('http://localhost:5000/api/admissions', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Application submitted successfully');
                formik.resetForm();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error submitting application');
            }
        },
    });

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchApplications();
        }
    }, [user]);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admissions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(response.data);
        } catch (error) {
            toast.error('Error fetching applications');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admissions/${id}`, 
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Application status updated');
            fetchApplications();
        } catch (error) {
            toast.error('Error updating application status');
        }
    };

    const renderAdminView = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Child's Name</TableCell>
                        <TableCell>Parent's Name</TableCell>
                        <TableCell>Program</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {applications.map((app) => (
                        <TableRow key={app._id}>
                            <TableCell>{app.childName}</TableCell>
                            <TableCell>{app.parentName}</TableCell>
                            <TableCell>{app.program}</TableCell>
                            <TableCell>{app.status}</TableCell>
                            <TableCell>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleStatusUpdate(app._id, 'approved')}
                                    sx={{ mr: 1 }}
                                >
                                    Approve
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                >
                                    Reject
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderApplicationForm = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Application Form
                        </Typography>
                        <form onSubmit={formik.handleSubmit}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Child's Name"
                                name="childName"
                                value={formik.values.childName}
                                onChange={formik.handleChange}
                                error={formik.touched.childName && Boolean(formik.errors.childName)}
                                helperText={formik.touched.childName && formik.errors.childName}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Child's Age"
                                name="childAge"
                                type="number"
                                value={formik.values.childAge}
                                onChange={formik.handleChange}
                                error={formik.touched.childAge && Boolean(formik.errors.childAge)}
                                helperText={formik.touched.childAge && formik.errors.childAge}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Child's Gender"
                                name="childGender"
                                select
                                SelectProps={{ native: true }}
                                value={formik.values.childGender}
                                onChange={formik.handleChange}
                                error={formik.touched.childGender && Boolean(formik.errors.childGender)}
                                helperText={formik.touched.childGender && formik.errors.childGender}
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </TextField>
                            <TextField
                                fullWidth
                                margin="normal"
                                type="date"
                                label="Date of Birth"
                                name="childDOB"
                                InputLabelProps={{ shrink: true }}
                                value={formik.values.childDOB}
                                onChange={formik.handleChange}
                                error={formik.touched.childDOB && Boolean(formik.errors.childDOB)}
                                helperText={formik.touched.childDOB && formik.errors.childDOB}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Parent's Name"
                                name="parentName"
                                value={formik.values.parentName}
                                onChange={formik.handleChange}
                                error={formik.touched.parentName && Boolean(formik.errors.parentName)}
                                helperText={formik.touched.parentName && formik.errors.parentName}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Email"
                                name="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Phone"
                                name="phone"
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                error={formik.touched.phone && Boolean(formik.errors.phone)}
                                helperText={formik.touched.phone && formik.errors.phone}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Address"
                                name="address"
                                multiline
                                rows={3}
                                value={formik.values.address}
                                onChange={formik.handleChange}
                                error={formik.touched.address && Boolean(formik.errors.address)}
                                helperText={formik.touched.address && formik.errors.address}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Program"
                                name="program"
                                select
                                SelectProps={{ native: true }}
                                value={formik.values.program}
                                onChange={formik.handleChange}
                                error={formik.touched.program && Boolean(formik.errors.program)}
                                helperText={formik.touched.program && formik.errors.program}
                            >
                                <option value="">Select a program</option>
                                <option value="toddler">Toddler Program (1-2 years)</option>
                                <option value="preschool">Preschool (3-4 years)</option>
                                <option value="kindergarten">Kindergarten (5-6 years)</option>
                            </TextField>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Additional Information"
                                name="additionalInfo"
                                multiline
                                rows={4}
                                value={formik.values.additionalInfo}
                                onChange={formik.handleChange}
                            />
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(event) => {
                                        formik.setFieldValue('documents', event.currentTarget.files);
                                    }}
                                />
                                <Typography variant="caption" display="block" gutterBottom>
                                    Accepted files: PDF, DOC, DOCX, JPG, JPEG, PNG (max 5 files, 5MB each)
                                </Typography>
                            </Box>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 3 }}
                            >
                                Submit Application
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Admission Process
                        </Typography>
                        <Stepper orientation="vertical">
                            <Step active>
                                <StepLabel>Submit Application Form</StepLabel>
                            </Step>
                            <Step active>
                                <StepLabel>Document Review</StepLabel>
                            </Step>
                            <Step active>
                                <StepLabel>Interview</StepLabel>
                            </Step>
                            <Step active>
                                <StepLabel>Final Decision</StepLabel>
                            </Step>
                        </Stepper>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    return (
        <Box sx={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(${admissionsBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            py: 4
        }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                        Join Our Happy Kids Family
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Start your child's educational journey with us
                    </Typography>
                </Box>
                {user?.role === 'admin' ? renderAdminView() : renderApplicationForm()}
            </Container>
        </Box>
    );
}

export default Admissions;