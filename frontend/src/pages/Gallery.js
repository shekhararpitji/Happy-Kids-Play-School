import { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Box,
    ImageList,
    ImageListItem,
    Tabs,
    Tab,
    MenuItem
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function Gallery() {
    const [images, setImages] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [category, setCategory] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        image: null
    });
    const { user } = useAuth();

    const categories = ['all', 'classroom', 'activities', 'events', 'playground'];

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/gallery');
            setImages(response.data);
        } catch (error) {
            toast.error('Error fetching gallery images');
        }
    };

    const handleOpen = (image = null) => {
        if (image) {
            setFormData({
                title: image.title,
                description: image.description,
                category: image.category
            });
            setSelectedImage(image);
        } else {
            setFormData({
                title: '',
                description: '',
                category: '',
                image: null
            });
            setSelectedImage(null);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formDataObj = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) formDataObj.append(key, formData[key]);
            });

            if (selectedImage) {
                await axios.put(`http://localhost:5000/api/gallery/${selectedImage._id}`, 
                    formDataObj,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Image updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/gallery', 
                    formDataObj,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Image added successfully');
            }
            handleClose();
            fetchImages();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving image');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/gallery/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Image deleted successfully');
                fetchImages();
            } catch (error) {
                toast.error('Error deleting image');
            }
        }
    };

    const filteredImages = category === 'all' 
        ? images 
        : images.filter(img => img.category === category);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Photo Gallery
                </Typography>
                {user?.role === 'admin' && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpen()}
                    >
                        Add Photo
                    </Button>
                )}
            </Box>

            <Tabs
                value={category}
                onChange={(e, newValue) => setCategory(newValue)}
                sx={{ mb: 3 }}
                centered
            >
                {categories.map((cat) => (
                    <Tab 
                        key={cat}
                        label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                        value={cat}
                    />
                ))}
            </Tabs>

            <ImageList variant="masonry" cols={3} gap={8}>
                {filteredImages.map((item) => (
                    <ImageListItem key={item._id}>
                        <img
                            src={`http://localhost:5000/uploads/gallery/${item.image}`}
                            alt={item.title}
                            loading="lazy"
                            style={{ borderRadius: '8px' }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                p: 1,
                                borderBottomLeftRadius: '8px',
                                borderBottomRightRadius: '8px'
                            }}
                        >
                            <Typography variant="subtitle1">{item.title}</Typography>
                            {user?.role === 'admin' && (
                                <Box>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleOpen(item)}
                                        sx={{ color: 'white' }}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleDelete(item._id)}
                                        sx={{ color: 'white' }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    </ImageListItem>
                ))}
            </ImageList>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {selectedImage ? 'Edit Photo' : 'Add New Photo'}
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
                            select
                            fullWidth
                            margin="normal"
                            label="Category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.filter(cat => cat !== 'all').map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </MenuItem>
                            ))}
                        </TextField>
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
                        {selectedImage ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Gallery;