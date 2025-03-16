import { Box, Container, Grid, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
    return (
        <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', py: 6, mt: 'auto' }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            Happy Kids Play School
                        </Typography>
                        <Typography variant="body2">
                            Nurturing young minds with love and care.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            Quick Links
                        </Typography>
                        <Link component={RouterLink} to="/about" color="inherit" display="block">
                            About Us
                        </Link>
                        <Link component={RouterLink} to="/events" color="inherit" display="block">
                            Events
                        </Link>
                        <Link component={RouterLink} to="/gallery" color="inherit" display="block">
                            Gallery
                        </Link>
                        <Link component={RouterLink} to="/admissions" color="inherit" display="block">
                            Admissions
                        </Link>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            Contact Us
                        </Typography>
                        <Typography variant="body2"> 
                        332F+7GC, Gayatri Mandir Rd, Sudna,<br />
                            Medininagar, Jharkhand 822101<br />
                            Phone: (123) 456-7890<br />
                            Email: info@happykids.com
                        </Typography>
                    </Grid>
                </Grid>
                <Box mt={5}>
                    <Typography variant="body2" align="center">
                        © {new Date().getFullYear()} Happy Kids Play School. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

export default Footer;