import { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Box
} from '@mui/material';
import { Add, Edit, Delete, Event, LocationOn } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function Events() {
    const [events, setEvents] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        image: null
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/events');
            setEvents(response.data);
        } catch (error) {
            toast.error('Error fetching events');
        }
    };

    const handleOpen = (event = null) => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description,
                date: event.date.split('T')[0],
                time: event.time,
                location: event.location
            });
            setSelectedEvent(event);
        } else {
            setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                location: '',
                image: null
            });
            setSelectedEvent(null);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedEvent(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formDataObj = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) formDataObj.append(key, formData[key]);
            });

            if (selectedEvent) {
                await axios.put(`http://localhost:5000/api/events/${selectedEvent._id}`, 
                    formDataObj,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Event updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/events', 
                    formDataObj,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Event added successfully');
            }
            handleClose();
            fetchEvents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving event');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/events/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Event deleted successfully');
                fetchEvents();
            } catch (error) {
                toast.error('Error deleting event');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Upcoming Events
                </Typography>
                {user?.role === 'admin' && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpen()}
                    >
                        Add Event
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {events.map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event._id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="200"
                                image={`http://localhost:5000/uploads/events/${event.image}`}
                                alt={event.title}
                            />
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {event.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {event.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Event sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                        {new Date(event.date).toLocaleDateString()} at {event.time}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocationOn sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                        {event.location}
                                    </Typography>
                                </Box>
                                {user?.role === 'admin' && (
                                    <Box sx={{ mt: 2 }}>
                                        <IconButton onClick={() => handleOpen(event)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(event._id)}>
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedEvent ? 'Edit Event' : 'Add New Event'}
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            type="date"
                            label="Date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            type="time"
                            label="Time"
                            InputLabelProps={{ shrink: true }}
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedEvent ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Events;