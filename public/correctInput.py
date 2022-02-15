# -*- coding: utf-8 -*-
"""WebCompetition.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1OhNbnB88qFmNny27IR4Rc-tz8r1ZujkP
"""

# !pip install -q pyomo
# !apt-get install -y -qq glpk-utils

from pyomo.environ import *
from pyomo.opt import SolverFactory
import numpy as np
import sys
import json


I = int(sys.argv[1])
Np = int(sys.argv[2])
JsonStr = sys.argv[3]
difficulty = int(sys.argv[4])/100
portionDD = int(sys.argv[5])/100
dataJson = json.loads(JsonStr)
cost = dataJson['costM']
weight = dataJson['weights']
capacity = dataJson['capacity']

# np.random.seed(1234)
f = np.array(weight,dtype=np.uint32) # boshen gives an array sink = 0
f[I-1] = 0 # indicate source


r_t = difficulty
r_a = 1-r_t

d = portionDD

c = np.array(cost) # boshen gives cost matrix instead of random [I*I matrix] cost = distance [row to column] very big if not connected
# for i in range(I):
#     c[i,i] = 0
c_p_1 = 200
c_p_2 = 100
#print(c)

big_m_1 = 100
big_m_2 = 100

cp = np.array(capacity) # boshen gives capacity matrix instead of random I*I matrix capacity = width 0 if not connected
# for i in range(I):
#     cp[i,i] = 0
#print(cp)

f



# create a model
model = ConcreteModel()

# declare decision variables
model.z_a = Var(range(I), range(I), domain=NonNegativeReals)
model.z_t = Var(range(I), range(I), domain=NonNegativeReals)
model.x = Var(range(I), range(I), domain=Binary)
# model.D = Var(range(I), range(I), domain=NonNegativeReals)
model.alpha = Var(range(I), range(I), domain=NegativeReals)
model.beta = Var(range(I))
model.gamma= Var(range(I))
model.tau = Var(range(I))
model.y_a = Var(range(I), range(I), domain=NonNegativeReals)
model.y_t = Var(range(I), range(I), domain=NonNegativeReals)
model.y_n = Var(range(I), range(I), domain=NonNegativeReals)
model.b = Var(range(I), range(I), domain=Binary)
# model.qq = Var(range(I), range(I), range(I), domain=Binary)

# declare objective
model.obj = Objective(expr = sum(model.z_a[i,j] for i in range(I) for j in range(I)) +sum(model.z_t[i,j] for i in range(I) for j in range(I)  ) , sense=maximize)

# declare constraints
model.bound = ConstraintList()
for i in range(I):
  for j in range(I):
    # model.bound.add(model.z[i,j] == model.x[i,j] * model.D[i,j]) #3b
    model.bound.add(model.z_a[i,j] >= 0) #3c
    model.bound.add(model.z_a[i,j] >= model.y_a[i,j] + model.x[i,j] * big_m_1 - big_m_1) #3d
    model.bound.add(model.z_a[i,j] <= model.y_a[i,j]) #3e
    model.bound.add(model.z_a[i,j] <= model.x[i,j] * big_m_1) #3f 
    model.bound.add(model.z_t[i,j] >= 0) #3c
    model.bound.add(model.z_t[i,j] >= model.y_t[i,j] + model.x[i,j] * big_m_1 - big_m_1) #3d
    model.bound.add(model.z_t[i,j] <= model.y_t[i,j]) #3e
    model.bound.add(model.z_t[i,j] <= model.x[i,j] * big_m_1) #3f 

    model.bound.add(model.alpha[i,j] + model.beta[i] -  model.beta[j]  <= c[i,j] + c_p_1*model.x[i,j]) #3i
    model.bound.add(model.alpha[i,j] + model.tau[i] -  model.tau[j]  <= c[i,j] + c_p_2*model.x[i,j]) #3i
    model.bound.add(model.alpha[i,j] + model.gamma[i] -  model.gamma[j]  <= c[i,j] ) #3i

    model.bound.add(model.alpha[i,j]  >= - big_m_2* model.b[i,j] ) #5k


    model.bound.add(model.y_a[i,j]+model.y_t[i,j]+model.y_n[i,j] - cp[i,j]  <= big_m_2* model.b[i,j] ) #5i


for i in range(I-1):
   model.bound.add(f[i]*d*r_a +sum(model.y_a[j,i] for j in range(I)) == sum(model.y_a[i,j] for j in range(I)) ) #5m
   model.bound.add(f[i]*d*r_t +sum(model.y_t[j,i] for j in range(I)) == sum(model.y_t[i,j] for j in range(I)) ) #5n
   model.bound.add(f[i]*(1-d) +sum(model.y_n[j,i] for j in range(I)) == sum(model.y_n[i,j] for j in range(I)) ) #5o

model.bound.add(sum(model.y_a[j,I-1] for j in range(I)) + sum(model.y_n[j,I-1] for j in range(I))+sum(model.y_t[j,I-1] for j in range(I)) == sum(f) ) #source

    # model.bound.add(model.D[i,j] <= M * model.q[i,j]) #3l1
    # model.bound.add(-model.alpha[i,j] + c[i,j] + c_penalty*model.x[i,j] <= M*(1-model.q[i,j])) #3l2
    # model.bound.add(sum(model.y[i,j,k] for k in range(I)) - N[i,j]*model.x[i,j]*ra == 0)
    # model.bound.add(model.D[i,j]-N[i,j]+sum(model.y[i,j,d] for d in range(I))-sum(model.y[i,k,j] for k in range(I)) == 0) #3k

# for i in range(I):
#   for j in range(I):
#     for k in range(I):
#       if k != i and k!= j:
#         model.bound.add(model.beta[i,j] + model.alpha[i,j] - model.alpha[i,k] <= 0) # 3j
#         model.bound.add(model.y[i,j,k] <= M * model.qq[i,j,k]) #3m1
#         model.bound.add(-model.beta[i,j] - model.alpha[i,j] + model.alpha[i,k] <= M * (1-model.qq[i,j,k])) #3m2
       

model.bound.add(sum(model.x[i,j] for i in range(I) for j in range(I)) <= Np) #3g   

#for i in range(I):
  #for j in range(I):
    #for k in range(I):
      #for d in range(I):
        #if d != i and d!= j and k!= i and k!= j:
          #model.bound.add(model.D[i,j]-N[i,j]+sum(model.y[i,j,d] for d in range(I))-sum(model.y[i,k,j] for k in range(N)) == 0) #3k

SolverFactory("glpk").solve(model)
best_result = model.obj()
print(best_result)
List = []
for i in model.x:
  if model.x[i].value == 1.0:
      List.append(i)
for l in List:
  print(l)




# opt = SolverFactory('glpk')
# opt.solve(model)

