import numpy as np
from scipy import signal
from main_functions import filter
import pandas as pd
from flask import Flask, jsonify , request, render_template 
import json


class processing():
    def __init__(self):
        self.folter=filter()

    def set_components(self, zeros:list,poles:list,gain:float) ->None:
        self.folter.set_zeros(zeros)
        self.folter.set_poles(poles)
        self.folter.set_gain(gain) 

    def get_Components(self) -> tuple:
        return self.folter.get_components()

    def apply_filter(self,input_arr:np.ndarray):
        numrator,denominator=signal.zpk2tf(self.folter.zeros,self.folter.poles,1)
        output_signal=signal.lfilter(numrator,denominator,input_arr)
        return output_signal.real

    def get_zeros_poles(self):
        return self.folter.zeros,self.folter.poles


    







