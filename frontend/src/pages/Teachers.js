import { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Avatar,
    IconButton,
    Chip
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        qualification: '',
        photo: null
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/teachers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeachers(response.data);
        } catch (error) {
            toast.error('Error fetching teachers');
        }
    };

    const handleOpen = (teacher = null) => {
        if (teacher) {
            setFormData({
                name: teacher.name,
                email: teacher.email,
                phone: teacher.phone,
                subject: teacher.subject,
                qualification: teacher.qualification
            });
            setSelectedTeacher(teacher);
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                qualification: '',
                photo: null
            });
            setSelectedTeacher(null);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedTeacher(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formDataObj = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) formDataObj.append(key, formData[key]);
            });

            if (selectedTeacher) {
                await axios.put(`http://localhost:5000/api/teachers/${selectedTeacher._id}`, 
                    formDataObj,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Teacher updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/teachers', 
                    formDataObj,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Teacher added successfully');
            }
            handleClose();
            fetchTeachers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving teacher');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/teachers/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Teacher deleted successfully');
                fetchTeachers();
            } catch (error) {
                toast.error('Error deleting teacher');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Teachers Management
                </Typography>
                {user?.role === 'admin' && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpen()}
                        sx={{ mb: 2 }}
                    >
                        Add New Teacher
                    </Button>
                )}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Photo</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Subject</TableCell>
                                <TableCell>Qualification</TableCell>
                                {user?.role === 'admin' && <TableCell>Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teachers.map((teacher) => (
                                <TableRow key={teacher._id}>
                                    <TableCell>
                                        <Avatar
                                            src={`http://localhost:5000/uploads/teachers/${teacher.photo}`}
                                            alt={teacher.name}
                                        />
                                    </TableCell>
                                    <TableCell>{teacher.name}</TableCell>
                                    <TableCell>{teacher.email}</TableCell>
                                    <TableCell>
                                        <Chip label={teacher.subject} color="primary" variant="outlined" />
                                    </TableCell>
                                    <TableCell>{teacher.qualification}</TableCell>
                                    {user?.role === 'admin' && (
                                        <TableCell>
                                            <IconButton onClick={() => handleOpen(teacher)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(teacher._id)}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {selectedTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Subject"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Qualification"
                            value={formData.qualification}
                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedTeacher ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Teachers;