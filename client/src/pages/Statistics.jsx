import { Box, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Card, CardContent,Tab } from '@mui/material'
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import React from 'react'
import dayjs from 'dayjs';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import { useEffect } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Chart from '../components/Chart'
import Navbar from '../components/Navbar'
import { publicRequest, userRequest } from '../publicRequest'
import BeatLoader from "react-spinners/BeatLoader";
import { useMemo, useRef } from 'react'
import { buyerColumn, sellerColumn } from './dataTables';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';


const Statistics = () => {

    const navigate = useNavigate()

    const [grossIncome , setGrossIncome] = useState()
    const [spent , setSpent] = useState()

    const [recentTransaction, setRecentTransaction] = useState([])
    const [productQuantity, setProductQuantity] = useState()
    const [orderStats, setOrderStats] = useState([])
    const [executing, setExecuting] = useState(false);

    const [cancelTransactions, setCancelTransactions] = useState([])
    const [value, setValue] = useState('1')

    const handleChangeTab = (e, newValue) =>{
        setValue(newValue)
    }

    const [loading, setLoading] = useState(true)
    const {id} = useParams()

    const statusColor={
        complete:'lime',
        pending:'yellow',
        canceled:'red',
        }

        

    const MONTHS = useMemo(
        () => [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
        ],[]
    )

//SALES METHODS
    useEffect(() => {
        const getStats = async () =>{
              try {
                const res = await userRequest.get(`/cart/total/${id}`)
                setGrossIncome(res.data[0].total)
                setLoading(false)
              } catch (error) {
              }
        }   
        getStats()
    },[id,setGrossIncome,setRecentTransaction,setOrderStats, MONTHS])

    
    useEffect(() =>{
        const getIncomeStats = async () =>{
            try {
                const res = await userRequest.get(`/cart/previousSales/${id}`)
                const list = res.data.sort((a,b)=>{
                    return a._id - b._id
                })
                

                list.map((item) =>
                setOrderStats((prev) => [
                  ...prev,
                  { name: `${MONTHS[item._id.month - 1]} ${item._id.year}`, "Total Sales": item.total },
                ])
              );
            } catch (error) {
            }
        }
        getIncomeStats()
    },[id,setGrossIncome,setRecentTransaction,setOrderStats, MONTHS])

    useEffect(() => {
        const getStats = async () =>{
              try {
                const res = await userRequest.get(`/cart/totalbuy/${id}`)
                setSpent(res.data[0].total)
                setLoading(false)
              } catch (error) {
              }
        }   
        getStats()
    },[id,setGrossIncome,setRecentTransaction,setOrderStats, MONTHS, setSpent])

    
    useEffect(() => {
        const getStats = async () =>{
          
            try {
                let res = await userRequest.get(`/cart/recentTransaction/${id}`)
                let cancelledOrder = res.data.filter((cancel) => cancel.canceled !== true)
                let listOfCancelledOrder = res.data.filter((cancel) => cancel.canceled === true)
                console.log(listOfCancelledOrder)
                setRecentTransaction(cancelledOrder)
                setCancelTransactions(listOfCancelledOrder)
                setLoading(false)
            } catch (error) {
                console.log({error: error.message})
            }

        }   
    getStats()
},[id,setGrossIncome,setRecentTransaction,setOrderStats, MONTHS])




//SPENT

const [spentIncome, setSpentIncome] = useState()
const [recentSpentTransaction, setRecentSpentTransaction] = useState([])
const [spentStats,setSpentStats] = useState()

useEffect(() =>{
   const getRecentSpent = async () =>{
        let res = await publicRequest.get(`/cart/recentBuy/${id}`)
        let completedOrder = res.data.filter((d) => d.status === 'complete')
        setRecentSpentTransaction(completedOrder)
        setLoading(false)
    }
   getRecentSpent()
},[setRecentSpentTransaction,id])



// ACTION METHODS 
    const confirmSell = async (e) => {
        try {
            await userRequest.put(`/cart/${e}`, {status: 'complete'})
            navigate(0);

        } catch (error) {
            console.log({error: error.message})
        }
    }

    const cancelOrder = async (e, quantityItem) => {
       try {
        const res = await publicRequest.get(`/cart/find/${e}`)
        const orderQuantity = res.data.quantity
        const product = res.data.productId
        const getProduct = await userRequest.get(`/products/find/${product}`)
        const stockQuantity = getProduct?.data.quantity
        await userRequest.put(`/products/${product}`, {quantity: (stockQuantity - stockQuantity) + (stockQuantity + orderQuantity)})
        await publicRequest.put(`/cart/${e}`,{
            canceled: true,
            status: 'canceled'
        })
        navigate(0);

       } catch (error) {
        
       }
    }


    const actionForRecentTransaction = [
        {
            field: 'action',
            headerName: 'Action',
            width: 300,
            renderCell: (params) => {
                return(
                    <Box sx={{display: 'flex', alignItems:'center', justifyContent:'center', gap: '5px'}}>
                        {params.row.status === "complete" ? <Button variant="contained" disabled
                                            color="success">Confirm </Button> :<Button variant="contained"
                                            onClick={(e) => confirmSell(params.row._id)} 
                                            color="success">Confirm </Button>}
                    <Button variant='contained' color="secondary" onClick={(e) => cancelOrder(params.row._id, params.row.quantity)}>
                        Cancel
                    </Button>
                    </Box>
                )
            }
        }
    ]
    

  return (
    
    <Box>
        <Navbar />
        <Container maxWidth="xl">
           {loading ? (
          <BeatLoader 
          color="#36d7b7" 
          loading={loading}
          size={50}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
           ):
           (
            <Box sx={{ width: '100%', typography: 'body1', marginTop: 5}}>
                <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList size="large" onChange={handleChangeTab} aria-label="lab API tabs example" centered>
                    <Tab icon={<StackedLineChartIcon />}  iconPosition="start" label="Income" value="1" />
                    <Tab icon={<TrendingDownIcon />} textColor="secondary" iconPosition="start"  label="Spent" value="2" />
                    <Tab icon={<CancelPresentationIcon />} iconPosition="start"  label="Cancelled" value="3" />
                    </TabList>
                </Box>
                <TabPanel value="1">
                <Box sx={{display:'flex', alignItems:'center', justifyContent: 'center', flexDirection: 'column', marginTop: {xs: 0, md: 10}}} >
                    <Box  sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alingItems:'center', gap: 5,  width: '100%'}}>

                        <Box sx={{display:'flex', justifyContent: 'space-evenly', gap:2, flexDirection: {xs: 'column', md: 'row'}}}>
                                <Paper  elevation={3} sx={{width: {xs: '100%', md: '100%'}, padding: 2, border:1, borderColor: 'green'}}>
                                    <Box sx={{display:'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 2}}>
                                        <Typography variant="body1" fontWeight={700} color="text.disabled">Income (SELL)</Typography>
                                        <Typography sx={{fontSize: '28px', fontWeight: 300}} color="success.main"> ₱ {grossIncome || 0}</Typography>
                                    </Box>
                                </Paper>
                            
                                <Paper  elevation={3} sx={{width: {xs: '100%', md: '100%'}, padding: 2}}>
                                    <Box sx={{display:'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 2}}>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Typography variant="body1" fontWeight={700} color="text.disabled">Spent (BUY) </Typography>
                                        </Box>
                                        <Typography sx={{fontSize: '28px', fontWeight: 300}} color="error.main"> ₱ {spent || 0}</Typography>
                                    </Box>
                                </Paper>
                            </Box>

                            <Box  sx={{display: {xs: 'none', md: 'flex', width: '100%', alignItems:'center', justifyContent:'center'}}}>
                                <Paper elevate={3} sx={{padding: 4}}>
                                <Typography variant="h6" textAlign="center" fontWeight={700} color="text.disabled" marginBottom={2}>Total Sales</Typography>
                                    <Chart data={orderStats} stroke="#76ff03" color="#00e676" />
                                </Paper>     
                            </Box>
                    </Box>


                    <Box sx={{marginTop: 10, width: '100%', display:'flex', justifyContent: 'center',         flexDirection: 'column'}}>
                        <Typography variant="h4" sx={{fontWeight: 600, color: '#9e9e9e', textAlign: 'start'}}>Latest Transaction (SELL) </Typography>
                        <Box>
                        <Box mt={5}>
                        <DataGrid sx={{height: '800px', padding: "20px"}}
                        {...recentTransaction}
                        rows={loading ? []: recentTransaction}
                        getRowId={(row) => row._id}
                        columns={sellerColumn.concat(actionForRecentTransaction)}
                        components={{ Toolbar: GridToolbar }}
                        rowsPerPageOptions={[10]}
                        componentsProps={{
                            toolbar: {
                              showQuickFilter: true,
                              quickFilterProps: { debounceMs: 500 },
                            },
                          }}
                        />
                    </Box>           
                    </Box>
                    </Box>
                    </Box> 
                </TabPanel>
                <TabPanel  value="2">
                    
                <Box sx={{display:'flex', alignItems:'center', justifyContent: 'center', flexDirection: 'column', marginTop: {xs: 0, md: 10}}}>
                    <Box  sx={{display: 'flex', width: '100%', flexDirection: 'column', justifyContent: 'center', alingItems:'center', gap: 5}}>
                        <Box sx={{display:'flex', justifyContent: 'space-evenly', gap:2, flexDirection: {xs: 'column', md: 'row'}, width: '100%'}}>
                            <Paper  elevation={3} sx={{width: '100%', padding: 2}}>
                                <Box sx={{display:'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 2}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                        <Typography variant="body1" fontWeight={700} color="text.disabled">Income (SELL) </Typography>
                                    </Box>

                                    <Typography sx={{fontSize: '28px', fontWeight: 300}} color="success.main"> ₱ {grossIncome || 0}</Typography>
                                </Box>
                            </Paper>
            
                            <Paper  elevation={3} sx={{width: '100%', padding: 2, border:1, borderColor: 'red'}}>
                                <Box sx={{display:'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 2}}>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                        <Typography variant="body1" fontWeight={700} color="text.disabled">Spent (BUY) </Typography>
                                    </Box>
                                    <Typography sx={{fontSize: '28px', fontWeight: 300}} color="error.main"> ₱ {spent || 0}</Typography>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>

                    <Box sx={{marginTop: 10, width: '100%', display:'flex', justifyContent: 'center', flexDirection: 'column'}}>
                        <Typography variant="h4" sx={{fontWeight: 600, color: '#9e9e9e', textAlign: 'start'}}>Latest Transaction (BUY)</Typography>
                            <Box>
                            <Box mt={5}>
                                <DataGrid sx={{height: '800px', padding: "20px"}}
                                {...recentSpentTransaction}
                                rows={loading ? []: recentSpentTransaction}
                                getRowId={(row) => row._id}
                                columns={buyerColumn}
                                components={{ Toolbar: GridToolbar }}
                                rowsPerPageOptions={[10]}
                                componentsProps={{
                                    toolbar: {
                                    showQuickFilter: true,
                                    quickFilterProps: { debounceMs: 500 },
                                    },
                                }}
                                />
                            </Box>
                            </Box>
                        </Box>
                    </Box>
                </TabPanel>

                <TabPanel value="3">
                <Box sx={{display:'flex', alignItems:'center', justifyContent: 'center', flexDirection: 'column', marginTop: {xs: 0, md: 10}}}>

                    <Box sx={{marginTop: 10, width: '100%', display:'flex', justifyContent: 'center', flexDirection: 'column'}}>
                        <Typography variant="h4" sx={{fontWeight: 600, color: '#9e9e9e', textAlign: 'start'}}>Cancelled Transactions</Typography>
                            <Box>
                            <Box mt={5}>
                                <DataGrid sx={{height: '800px', padding: "20px"}}
                                {...cancelTransactions}
                                rows={loading ? []: cancelTransactions}
                                getRowId={(row) => row._id}
                                columns={buyerColumn}
                                components={{ Toolbar: GridToolbar }}
                                rowsPerPageOptions={[10]}
                                componentsProps={{
                                    toolbar: {
                                    showQuickFilter: true,
                                    quickFilterProps: { debounceMs: 500 },
                                    },
                                }}
                                />
                            </Box>
                            </Box>
                        </Box>
                    </Box>
                </TabPanel>
                
                </TabContext>
          </Box>
           )}

        </Container>
    </Box>
  )
}

export default Statistics


