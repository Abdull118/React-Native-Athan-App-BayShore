import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#007FFF',
      alignItems: 'flex-end',
      justifyContent: 'center',
      width:'100%',
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght'
  
    },
    prayers:{
      marginTop: 40,
      display: 'flex',
      marginRight: 110
    },  
    prayer: {
      display: 'flex',
      flexDirection: 'row',  
      width: 350,
      justifyContent: 'space-between',
      height: 55,
    },
    text:{
      color:'white',
      fontSize: 60, 
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght'
    },
    header:{
      backgroundColor:'white',
      width: '50%',
      position: 'absolute',
      left:0,
      height: '100%',
      display:'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 20,
      paddingTop:20,
   
    },
    date:{
      color: '#007FFF',
      fontSize: 55,
      fontWeight: 300,
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght'
    },
    time:{
      color: '#007FFF',
      fontSize: 100,
      fontWeight: 600,
      marginBottom: 25,
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght'
    },

    countDown:{
      color: '#007FFF',
      fontSize: 80,
      fontWeight: 600,
      marginBottom: 25,
      fontFamily: 'YanoneKaffeesatz-VariableFont_wght'
    }
  });