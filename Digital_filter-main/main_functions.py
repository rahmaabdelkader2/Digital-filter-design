import numpy as np
from scipy import signal


class filter():
    def __init__(self) -> None:
        self.zeros=[]
        self.poles=[]
        self.gain=1
    def set_zeros(self,zeros:list):
        self.zeros=zeros

    def set_poles(self,poles:list):
        self.poles=poles

    def set_gain(self,gain:float):
        self.gain=gain

    def get_components(self) -> tuple:
        frequency,freq_response = signal.freqz_zpk(self.zeros,self.poles,self.gain)   
        magnitude=20*np.log(np.abs(freq_response))  
        phase=np.unwrap(np.angle(freq_response))
        return(frequency,magnitude,phase)

    

