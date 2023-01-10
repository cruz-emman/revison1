import { Box, Card, CardActionArea, CardMedia, Container, Tooltip, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ProductList from '../components/ProductList'
import { publicRequest } from '../publicRequest'
import BeatLoader from "react-spinners/BeatLoader";
import { itemTables } from '../dataTables'


const CategoryPage = () => {
  const location = useLocation()
  const [products, setProducts] = useState([])
  const category = location.pathname.split('/')[2]
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
      const getProductsCategory = async () =>{
        let res = await publicRequest.get(category ? `/products?category=${category}`: '/products/' )
        if(res.data.length === 0) {
          res = await publicRequest.get('/products/');
       }
        setProducts(res.data)
        setLoading(false)
      }
      getProductsCategory()
  },[setProducts,category,location,setLoading])

  
  return (
    <Box>
      <Navbar />
      {loading ?
          <BeatLoader 
              color="#36d7b7" 
              loading={loading}
              size={50}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
        :
        <>
         <Container maxWidth="xl">
          <Typography variant="h4" sx={{textAlign:'center', paddingY: '40px', textTransform: 'uppercase', fontWeight: 600, color: '#757575'}}>Courses</Typography>
          <Box sx={{display: 'flex', justifyContent: 'space-evenly', alingItems:'center', flexWrap: 'wrap', marginX: {xs: '20px', md: '0px'}, gap: 2, padding: {xs: 2, md: 4},  boxShadow: 2, marginY: 2 }}>
            {itemTables.map((data) => (
              <Link to={data.to} key={data.id}>
                        <Card sx={{height: {xs: 100, md: 150}, width: {xs: 100, md: 150}, borderRadius: '50%', boxShadow: 3}}>
                          <CardActionArea>
                            <Tooltip title={data.name}>
                              <CardMedia component='img'  
                                    image={data.img}
                                />
                            </Tooltip>
                          </CardActionArea>
                        </Card>
                    </Link>
              ))}
          </Box>
        </Container>
        <ProductList products={products} category={category} />
        </>
      }
    </Box>
  )
}

export default CategoryPage