import { useState, useEffect } from 'react';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    Box, 
    Card, 
    CardContent,
    Avatar,
    LinearProgress,
    Divider,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    Alert,
    Chip,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CardMedia,
    CardActions,
    IconButton
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

function Dashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        events: 0,
        admissions: 0
    });
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // User management state
    const [users, setUsers] = useState([]);
    const [userDialog, setUserDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userFormData, setUserFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'teacher'
    });

    // Admission management state
    const [admissions, setAdmissions] = useState([]);
    const [admissionDialog, setAdmissionDialog] = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState(null);
    const [admissionFormData, setAdmissionFormData] = useState({
        childName: '',
        parentName: '',
        contactNumber: '',
        email: '',
        age: '',
        address: '',
        status: 'pending'
    });

    // Gallery management state
    const [gallery, setGallery] = useState([]);
    const [galleryDialog, setGalleryDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [galleryFormData, setGalleryFormData] = useState({
        title: '',
        description: ''
    });

    // Event management state
    const [events, setEvents] = useState([]);
    const [eventDialog, setEventDialog] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventFormData, setEventFormData] = useState({
        title: '',
        description: '',
        date: new Date(),
        location: '',
        time: ''
    });

    // Fetch data based on active tab
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchStats();
            
            // Fetch data based on active tab
            const fetchTabData = async () => {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                try {
                    switch(activeTab) {
                        case 0: // Dashboard - already fetched stats
                            break;
                        case 1: // Admissions
                            const admissionsRes = await axios.get('http://localhost:5000/api/admissions', { headers });
                            setAdmissions(admissionsRes.data);
                            break;
                        case 2: // Gallery
                            const galleryRes = await axios.get('http://localhost:5000/api/gallery', { headers });
                            setGallery(galleryRes.data);
                            break;
                        case 3: // Events
                            const eventsRes = await axios.get('http://localhost:5000/api/events', { headers });
                            setEvents(eventsRes.data);
                            break;
                        case 4: // Users
                            const usersRes = await axios.get('http://localhost:5000/api/users', { headers });
                            setUsers(usersRes.data);
                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    console.error('Error fetching tab data:', error);
                    setSnackbar({
                        open: true,
                        message: 'Failed to load data',
                        severity: 'error'
                    });
                }
            };
            
            fetchTabData();
        } else {
            setLoading(false);
        }
    }, [user, activeTab]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({
            ...snackbar,
            open: false
        });
    };

    // User management handlers
    const openUserDialog = (user = null) => {
        if (user) {
            setSelectedUser(user);
            setUserFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role
            });
        } else {
            setSelectedUser(null);
            setUserFormData({
                name: '',
                email: '',
                password: '',
                role: 'teacher'
            });
        }
        setUserDialog(true);
    };

    const closeUserDialog = () => {
        setUserDialog(false);
        setSelectedUser(null);
    };

    const handleUserInputChange = (e) => {
        const { name, value } = e.target;
        setUserFormData({
            ...userFormData,
            [name]: value
        });
    };

    const handleUserSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (selectedUser) {
                // Update existing user
                const userData = { ...userFormData };
                if (!userData.password) delete userData.password; // Don't update password if empty
                
                await axios.put(`http://localhost:5000/api/users/${selectedUser._id}`, userData, { headers });
                setSnackbar({
                    open: true,
                    message: 'User updated successfully!',
                    severity: 'success'
                });
            } else {
                // Create new user
                await axios.post('http://localhost:5000/api/auth/register', userFormData, { headers });
                setSnackbar({
                    open: true,
                    message: `${userFormData.role === 'teacher' ? 'Teacher' : 'Parent'} created successfully!`,
                    severity: 'success'
                });
            }
            
            // Refresh users list
            const usersRes = await axios.get('http://localhost:5000/api/users', { headers });
            setUsers(usersRes.data);
            
            // Refresh stats
            const statsRes = await axios.get('http://localhost:5000/api/dashboard/stats', { headers });
            setStats(statsRes.data);
            
            closeUserDialog();
        } catch (error) {
            console.error('Error submitting user:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to save user',
                severity: 'error'
            });
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local state
            setUsers(users.filter(user => user._id !== id));
            
            setSnackbar({
                open: true,
                message: 'User deleted successfully!',
                severity: 'success'
            });
            
            // Refresh stats
            const statsRes = await axios.get('http://localhost:5000/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error deleting user:', error);
            setSnackbar({
                open: true,
                message: 'Failed to delete user',
                severity: 'error'
            });
        }
    };

    // Admission management handlers
    const openAdmissionDialog = (admission = null) => {
        if (admission) {
            setSelectedAdmission(admission);
            setAdmissionFormData({
                childName: admission.childName,
                parentName: admission.parentName,
                contactNumber: admission.contactNumber,
                email: admission.email,
                age: admission.age || '',
                address: admission.address || '',
                status: admission.status
            });
        } else {
            setSelectedAdmission(null);
            setAdmissionFormData({
                childName: '',
                parentName: '',
                contactNumber: '',
                email: '',
                age: '',
                address: '',
                status: 'pending'
            });
        }
        setAdmissionDialog(true);
    };

    const closeAdmissionDialog = () => {
        setAdmissionDialog(false);
        setSelectedAdmission(null);
    };

    const handleAdmissionInputChange = (e) => {
        const { name, value } = e.target;
        setAdmissionFormData({
            ...admissionFormData,
            [name]: value
        });
    };

    const handleAdmissionSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (selectedAdmission) {
                // Update existing admission
                await axios.put(
                    `http://localhost:5000/api/admissions/${selectedAdmission._id}`,
                    admissionFormData,
                    { headers }
                );
                setSnackbar({
                    open: true,
                    message: 'Admission updated successfully!',
                    severity: 'success'
                });
            } else {
                // Create new admission
                await axios.post(
                    'http://localhost:5000/api/admissions',
                    admissionFormData,
                    { headers }
                );
                setSnackbar({
                    open: true,
                    message: 'Admission created successfully!',
                    severity: 'success'
                });
            }
            
            // Refresh admissions list
            const admissionsRes = await axios.get('http://localhost:5000/api/admissions', { headers });
            setAdmissions(admissionsRes.data);
            
            // Refresh stats
            const statsRes = await axios.get('http://localhost:5000/api/dashboard/stats', { headers });
            setStats(statsRes.data);
            
            closeAdmissionDialog();
        } catch (error) {
            console.error('Error submitting admission:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save admission',
                severity: 'error'
            });
        }
    };

    const handleUpdateAdmissionStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/admissions/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update local state
            setAdmissions(admissions.map(admission => 
                admission._id === id ? { ...admission, status } : admission
            ));
            
            setSnackbar({
                open: true,
                message: `Admission status updated to ${status}`,
                severity: 'success'
            });
            
            // Refresh stats
            const statsRes = await axios.get('http://localhost:5000/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error updating admission status:', error);
            setSnackbar({
                open: true,
                message: 'Failed to update status',
                severity: 'error'
            });
        }
    };

    const handleDeleteAdmission = async (id) => {
        if (!window.confirm('Are you sure you want to delete this admission?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admissions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local state
            setAdmissions(admissions.filter(admission => admission._id !== id));
            
            setSnackbar({
                open: true,
                message: 'Admission deleted successfully!',
                severity: 'success'
            });
            
            // Refresh stats
            const statsRes = await axios.get('http://localhost:5000/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error deleting admission:', error);
            setSnackbar({
                open: true,
                message: 'Failed to delete admission',
                severity: 'error'
            });
        }
    };

    // Gallery management handlers
    const openGalleryDialog = (image = null) => {
        if (image) {
            setSelectedImage(image);
            setGalleryFormData({
                title: image.title,
                description: image.description || ''
            });
            setImagePreview(`http://localhost:5000/uploads/gallery/${image.filename}`);
        } else {
            setSelectedImage(null);
            setGalleryFormData({
                title: '',
                description: ''
            });
        }
        setGalleryDialog(true);
    };

    const closeGalleryDialog = () => {
        setGalleryDialog(false);
        setSelectedImage(null);
        setImagePreview('');
    };

    const handleGalleryInputChange = (e) => {
        const { name, value } = e.target;
        setGalleryFormData({
            ...galleryFormData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleGallerySubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            };

            const formData = new FormData();
            formData.append('title', galleryFormData.title);
            formData.append('description', galleryFormData.description);
            
            if (typeof selectedImage === 'object' && selectedImage !== null && !(selectedImage._id)) {
                formData.append('image', selectedImage);
            }

            if (selectedImage && selectedImage._id) {
                // Update existing image
                await axios.put(
                    `http://localhost:5000/api/gallery/${selectedImage._id}`,
                    formData,
                    { headers }
                );
                setSnackbar({
                    open: true,
                    message: 'Image updated successfully!',
                    severity: 'success'
                });
            } else {
                // Create new image
                await axios.post(
                    'http://localhost:5000/api/gallery',
                    formData,
                    { headers }
                );
                setSnackbar({
                    open: true,
                    message: 'Image uploaded successfully!',
                    severity: 'success'
                });
            }

            // Refresh gallery data
            const galleryRes = await axios.get('http://localhost:5000/api/gallery', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setGallery(galleryRes.data);

            closeGalleryDialog();
        } catch (error) {
            console.error('Error submitting gallery image:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save image',
                severity: 'error'
            });
        }
    };

    const handleDeleteGalleryImage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/gallery/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local state
            setGallery(gallery.filter(image => image._id !== id));
            
            setSnackbar({
                open: true,
                message: 'Image deleted successfully!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error deleting image:', error);
            setSnackbar({
                open: true,
                message: 'Failed to delete image',
                severity: 'error'
            });
        }
    };

    // Event management handlers
    const openEventDialog = (event = null) => {
        if (event) {
            setSelectedEvent(event);
            setEventFormData({
                _id: event._id,
                title: event.title,
                description: event.description,
                date: new Date(event.date),
                location: event.location || '',
                time: event.time || ''
            });
        } else {
            setSelectedEvent(null);
            setEventFormData({
                title: '',
                description: '',
                date: new Date(),
                location: '',
                time: ''
            });
        }
        setEventDialog(true);
    };

    const closeEventDialog = () => {
        setEventDialog(false);
        setSelectedEvent(null);
    };

    const handleEventInputChange = (e) => {
        const { name, value } = e.target;
        setEventFormData({
            ...eventFormData,
            [name]: value
        });
    };

    const handleDateChange = (newDate) => {
        setEventFormData({
            ...eventFormData,
            date: newDate
        });
    };

    const handleEventSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (selectedEvent) {
                // Update existing event
                await axios.put(
                    `http://localhost:5000/api/events/${selectedEvent._id}`,
                    eventFormData,
                    { headers }
                );
                setSnackbar({
                    open: true,
                    message: 'Event updated successfully!',
                    severity: 'success'
                });
            } else {
                // Create new event
                await axios.post(
                    'http://localhost:5000/api/events',
                    eventFormData,
                    { headers }
                );
                setSnackbar({
                    open: true,
                    message: 'Event created successfully!',
                    severity: 'success'
                });
            }
            
            // Refresh events list
            const eventsRes = await axios.get('http://localhost:5000/api/events', { headers });
            setEvents(eventsRes.data);
            
            // Refresh stats
            const statsRes = await axios.get('http://localhost:5000/api/dashboard/stats', { headers });
            setStats(statsRes.data);
            
            closeEventDialog();
        } catch (error) {
            console.error('Error submitting event:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save event',
                severity: 'error'
            });
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local state
            setEvents(events.filter(event => event._id !== id));
            
            setSnackbar({
                open: true,
                message: 'Event deleted successfully!',
                severity: 'success'
            });
            
            // Refresh stats
            const statsRes = await axios.get('http://localhost:5000/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error deleting event:', error);
            setSnackbar({
                open: true,
                message: 'Failed to delete event',
                severity: 'error'
            });
        }
    };

    // Render dashboard overview tab
    const renderDashboardOverview = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
                        <Typography variant="h5" gutterBottom color="primary.main">
                            School Overview
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body1" paragraph>
                            Welcome to your admin dashboard. Here you can monitor key metrics about Happy Kids Play School.
                        </Typography>
                    </Paper>
                </motion.div>
            </Grid>

            {/* Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" color="text.secondary">Students</Typography>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    <ChildCareIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div">
                                {loading ? <LinearProgress /> : stats.students}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Total enrolled students
                            </Typography>
                        </CardContent>
                    </Card>
                </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" color="text.secondary">Teachers</Typography>
                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                    <SchoolIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div">
                                {loading ? <LinearProgress /> : stats.teachers}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Active teachers
                            </Typography>
                        </CardContent>
                    </Card>
                </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" color="text.secondary">Events</Typography>
                                <Avatar sx={{ bgcolor: 'success.main' }}>
                                    <EventIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div">
                                {loading ? <LinearProgress /> : stats.events}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Upcoming events
                            </Typography>
                        </CardContent>
                    </Card>
                </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" color="text.secondary">Admissions</Typography>
                                <Avatar sx={{ bgcolor: 'warning.main' }}>
                                    <PersonIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div">
                                {loading ? <LinearProgress /> : stats.admissions}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Pending admissions
                            </Typography>
                        </CardContent>
                    </Card>
                </motion.div>
            </Grid>
        </Grid>
    );

    // Render admissions tab
    const renderAdmissionsTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" color="primary.main">
                            Admission Requests
                        </Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={() => openAdmissionDialog()}
                        >
                            New Admission
                        </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    {loading ? (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgress />
                        </Box>
                    ) : admissions.length === 0 ? (
                        <Typography variant="body1" sx={{ py: 2 }}>
                            No admission requests found.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><Typography variant="subtitle2">Child Name</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Parent Name</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Contact</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {admissions.map((admission) => (
                                        <TableRow key={admission._id} hover>
                                            <TableCell>{admission.childName}</TableCell>
                                            <TableCell>{admission.parentName}</TableCell>
                                            <TableCell>{admission.contactNumber}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={admission.status} 
                                                    color={
                                                        admission.status === 'approved' ? 'success' : 
                                                        admission.status === 'rejected' ? 'error' : 'warning'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    {admission.status === 'pending' && (
                                                        <>
                                                            <IconButton 
                                                                size="small" 
                                                                color="success"
                                                                onClick={() => handleUpdateAdmissionStatus(admission._id, 'approved')}
                                                            >
                                                                <CheckCircleIcon />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => handleUpdateAdmissionStatus(admission._id, 'rejected')}
                                                            >
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                    <IconButton 
                                                        size="small" 
                                                        color="primary"
                                                        onClick={() => openAdmissionDialog(admission)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
                                                        onClick={() => handleDeleteAdmission(admission._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );

    // Render gallery tab
    const renderGalleryTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" color="primary.main">
                            School Gallery
                        </Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={() => openGalleryDialog()}
                        >
                            Add Image
                        </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    {loading ? (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgress />
                        </Box>
                    ) : gallery.length === 0 ? (
                        <Typography variant="body1" sx={{ py: 2 }}>
                            No images in the gallery.
                        </Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {gallery.map((image) => (
                                <Grid item xs={12} sm={6} md={4} key={image._id}>
                                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={`http://localhost:5000/uploads/gallery/${image.filename}`}
                                            alt={image.title}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {image.title}
                                            </Typography>
                                            {image.description && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {image.description}
                                                </Typography>
                                            )}
                                        </CardContent>
                                        <CardActions>
                                            <IconButton 
                                                size="small" 
                                                color="primary"
                                                onClick={() => openGalleryDialog(image)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                color="error"
                                                onClick={() => handleDeleteGalleryImage(image._id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );

    // Render events tab
    const renderEventsTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" color="primary.main">
                            School Events
                        </Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={() => openEventDialog()}
                        >
                            Add Event
                        </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    {loading ? (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgress />
                        </Box>
                    ) : events.length === 0 ? (
                        <Typography variant="body1" sx={{ py: 2 }}>
                            No events scheduled.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><Typography variant="subtitle2">Title</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Date</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Time</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Location</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {events.map((event) => (
                                        <TableRow key={event._id} hover>
                                            <TableCell>{event.title}</TableCell>
                                            <TableCell>{format(new Date(event.date), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell>{event.time || 'N/A'}</TableCell>
                                            <TableCell>{event.location || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton 
                                                        size="small" 
                                                        color="primary"
                                                        onClick={() => openEventDialog(event)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
                                                        onClick={() => handleDeleteEvent(event._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );

    // Render users tab
    const renderUsersTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" color="primary.main">
                            Users Management
                        </Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={() => openUserDialog()}
                        >
                            Add User
                        </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    {loading ? (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgress />
                        </Box>
                    ) : users.length === 0 ? (
                        <Typography variant="body1" sx={{ py: 2 }}>
                            No users found.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><Typography variant="subtitle2">Name</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Email</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Role</Typography></TableCell>
                                        <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id} hover>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={user.role} 
                                                    color={
                                                        user.role === 'admin' ? 'error' : 
                                                        user.role === 'teacher' ? 'primary' : 'default'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton 
                                                        size="small" 
                                                        color="primary"
                                                        onClick={() => openUserDialog(user)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    {user.role !== 'admin' && (
                                                        <IconButton 
                                                            size="small" 
                                                            color="error"
                                                            onClick={() => handleDeleteUser(user._id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );

    // Main render
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {false ? (
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                    <Typography variant="h5" color="error" align="center">
                        Access Denied
                    </Typography>
                    <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                        You do not have permission to access the admin dashboard.
                    </Typography>
                </Paper>
            ) : (
                <>
                    <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 3 }}>
                        <Tabs 
                            value={activeTab} 
                            onChange={handleTabChange} 
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                        >
                            <Tab label="Dashboard" />
                            <Tab label="Admissions" />
                            <Tab label="Gallery" />
                            <Tab label="Events" />
                            <Tab label="Users" />
                        </Tabs>
                    </Paper>

                    {activeTab === 0 && renderDashboardOverview()}
                    {activeTab === 1 && renderAdmissionsTab()}
                    {activeTab === 2 && renderGalleryTab()}
                    {activeTab === 3 && renderEventsTab()}
                    {activeTab === 4 && renderUsersTab()}

                    {/* Admission Dialog */}
                    <Dialog open={admissionDialog} onClose={closeAdmissionDialog} maxWidth="sm" fullWidth>
                        <DialogTitle>
                            {selectedAdmission ? 'Edit Admission' : 'New Admission'}
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="childName"
                                        label="Child's Name"
                                        value={admissionFormData.childName}
                                        onChange={handleAdmissionInputChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="parentName"
                                        label="Parent's Name"
                                        value={admissionFormData.parentName}
                                        onChange={handleAdmissionInputChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="contactNumber"
                                        label="Contact Number"
                                        value={admissionFormData.contactNumber}
                                        onChange={handleAdmissionInputChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="email"
                                        label="Email"
                                        type="email"
                                        value={admissionFormData.email}
                                        onChange={handleAdmissionInputChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="age"
                                        label="Child's Age"
                                        value={admissionFormData.age}
                                        onChange={handleAdmissionInputChange}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            name="status"
                                            value={admissionFormData.status}
                                            onChange={handleAdmissionInputChange}
                                            label="Status"
                                        >
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="approved">Approved</MenuItem>
                                            <MenuItem value="rejected">Rejected</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="address"
                                        label="Address"
                                        value={admissionFormData.address}
                                        onChange={handleAdmissionInputChange}
                                        fullWidth
                                        multiline
                                        rows={3}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeAdmissionDialog}>Cancel</Button>
                            <Button 
                                onClick={handleAdmissionSubmit} 
                                variant="contained"
                                color="primary"
                            >
                                {selectedAdmission ? 'Update' : 'Submit'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                   {/* Gallery Dialog */}
                    <Dialog open={galleryDialog} onClose={closeGalleryDialog} maxWidth="sm" fullWidth>
                        <DialogTitle>
                            {selectedImage && selectedImage._id ? 'Edit Image' : 'Add New Image'}
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        name="title"
                                        label="Title"
                                        value={galleryFormData.title}
                                        onChange={handleGalleryInputChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="description"
                                        label="Description"
                                        value={galleryFormData.description}
                                        onChange={handleGalleryInputChange}
                                        fullWidth
                                        multiline
                                        rows={3}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        fullWidth
                                        sx={{ height: 56 }}
                                    >
                                        {selectedImage && selectedImage._id ? 'Change Image' : 'Upload Image'}
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </Button>
                                </Grid>
                                {imagePreview && (
                                    <Grid item xs={12}>
                                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                style={{ 
                                                    maxWidth: '100%', 
                                                    maxHeight: '200px',
                                                    borderRadius: '4px'
                                                }} 
                                            />
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeGalleryDialog}>Cancel</Button>
                            <Button 
                                onClick={handleGallerySubmit} 
                                variant="contained"
                                color="primary"
                                disabled={!galleryFormData.title || (!imagePreview && !selectedImage?._id)}
                            >
                                {selectedImage && selectedImage._id ? 'Update' : 'Upload'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Event Dialog */}
                    <Dialog open={eventDialog} onClose={closeEventDialog} maxWidth="sm" fullWidth>
                        <DialogTitle>
                            {selectedEvent ? 'Edit Event' : 'Add New Event'}
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        name="title"
                                        label="Event Title"
                                        value={eventFormData.title}
                                        onChange={handleEventInputChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            label="Event Date"
                                            value={eventFormData.date}
                                            onChange={handleDateChange}
                                            renderInput={(params) => <TextField {...params} fullWidth required />}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="time"
                                        label="Event Time"
                                        value={eventFormData.time}
                                        onChange={handleEventInputChange}
                                        fullWidth
                                        placeholder="e.g. 2:00 PM"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="location"
                                        label="Location"
                                        value={eventFormData.location}
                                        onChange={handleEventInputChange}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="description"
                                        label="Description"
                                        value={eventFormData.description}
                                        onChange={handleEventInputChange}
                                        fullWidth
                                        multiline
                                        rows={4}
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeEventDialog}>Cancel</Button>
                            <Button 
                                onClick={handleEventSubmit} 
                                variant="contained"
                                color="primary"
                                disabled={!eventFormData.title || !eventFormData.description}
                            >
                                {selectedEvent ? 'Update' : 'Create'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* User Dialog */}
                    <Dialog open={userDialog} onClose={closeUserDialog} maxWidth="sm" fullWidth>
                        <DialogTitle>
                            {selectedUser ? 'Edit User' : 'Add New User'}
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        name="name"
                                        label="Full Name"
                                        value={userFormData.name}
                                        onChange={handleUserInputChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="email"
                                        label="Email Address"
                                        type="email"
                                        value={userFormData.email}
                                        onChange={handleUserInputChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                {!selectedUser && (
                                    <Grid item xs={12}>
                                        <TextField
                                            name="password"
                                            label="Password"
                                            type="password"
                                            value={userFormData.password}
                                            onChange={handleUserInputChange}
                                            fullWidth
                                            required
                                        />
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Role</InputLabel>
                                        <Select
                                            name="role"
                                            value={userFormData.role}
                                            onChange={handleUserInputChange}
                                            label="Role"
                                        >
                                            <MenuItem value="admin">Admin</MenuItem>
                                            <MenuItem value="teacher">Teacher</MenuItem>
                                            <MenuItem value="staff">Staff</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeUserDialog}>Cancel</Button>
                            <Button 
                                onClick={handleUserSubmit} 
                                variant="contained"
                                color="primary"
                                disabled={
                                    !userFormData.name || 
                                    !userFormData.email || 
                                    (!selectedUser && !userFormData.password)
                                }
                            >
                                {selectedUser ? 'Update' : 'Create'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Snackbar for notifications */}
                    <Snackbar 
                        open={snackbar.open} 
                        autoHideDuration={6000} 
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                        <Alert 
                            onClose={handleCloseSnackbar} 
                            severity={snackbar.severity} 
                            sx={{ width: '100%' }}
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </>
            )}
        </Container>
    );
};

export default Dashboard;