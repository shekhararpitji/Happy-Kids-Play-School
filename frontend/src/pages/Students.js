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
    IconButton
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

function Students() {
    const [students, setStudents] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        grade: '',
        parentId: '',
        photo: null
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
        } catch (error) {
            toast.error('Error fetching students');
        }
    };

    const handleOpen = (student = null) => {
        if (student) {
            setFormData({
                name: student.name,
                age: student.age,
                grade: student.grade,
                parentId: student.parentId
            });
            setSelectedStudent(student);
        } else {
            setFormData({
                name: '',
                age: '',
                grade: '',
                parentId: '',
                photo: null
            });
            setSelectedStudent(null);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedStudent(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formDataObj = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) formDataObj.append(key, formData[key]);
            });

            if (selectedStudent) {
                await axios.put(`http://localhost:5000/api/students/${selectedStudent._id}`, 
                    formDataObj,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Student updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/students', 
                    formDataObj,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Student added successfully');
            }
            handleClose();
            fetchStudents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving student');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/students/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Student deleted successfully');
                fetchStudents();
            } catch (error) {
                toast.error('Error deleting student');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Students Management
                </Typography>
                {user?.role === 'admin' && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpen()}
                        sx={{ mb: 2 }}
                    >
                        Add New Student
                    </Button>
                )}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Photo</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Age</TableCell>
                                <TableCell>Grade</TableCell>
                                <TableCell>Parent</TableCell>
                                {user?.role === 'admin' && <TableCell>Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student._id}>
                                    <TableCell>
                                        <Avatar
                                            src={`http://localhost:5000/uploads/students/${student.photo}`}
                                            alt={student.name}
                                        />
                                    </TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.age}</TableCell>
                                    <TableCell>{student.grade}</TableCell>
                                    <TableCell>{student.parentId?.name}</TableCell>
                                    {user?.role === 'admin' && (
                                        <TableCell>
                                            <IconButton onClick={() => handleOpen(student)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(student._id)}>
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
                    {selectedStudent ? 'Edit Student' : 'Add New Student'}
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
                            label="Age"
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Grade"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Parent ID"
                            value={formData.parentId}
                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
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
                        {selectedStudent ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Students;